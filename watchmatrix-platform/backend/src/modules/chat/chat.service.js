import prisma from "../../config/prisma.js";
import { emitConversationMessage, emitUsersEvent } from "../../realtime/socket.js";

function isAllowedRolePair(roleA, roleB) {
  const customerSeller = roleA === "CUSTOMER" && roleB === "SELLER";
  const sellerCustomer = roleA === "SELLER" && roleB === "CUSTOMER";
  const sellerAdmin = roleA === "SELLER" && roleB === "ADMIN";
  const adminSeller = roleA === "ADMIN" && roleB === "SELLER";

  return customerSeller || sellerCustomer || sellerAdmin || adminSeller;
}

async function getUserById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true
    }
  });
}

async function assertConversationAccess(userId, conversationId) {
  const member = await prisma.conversationMember.findFirst({
    where: {
      conversationId,
      userId
    },
    select: {
      id: true
    }
  });

  if (!member) {
    const err = new Error("Conversation not found");
    err.statusCode = 404;
    throw err;
  }
}

function toConversationSummary(conversation, currentUserId, unreadCount = 0) {
  const lastMessage = conversation.messages[0] || null;
  const otherMembers = conversation.members
    .filter((member) => member.user.id !== currentUserId)
    .map((member) => member.user);

  return {
    id: conversation.id,
    type: conversation.type,
    orderId: conversation.orderId,
    updatedAt: conversation.updatedAt,
    members: conversation.members.map((member) => member.user),
    counterpart: otherMembers[0] || null,
    lastMessage: lastMessage
      ? {
          id: lastMessage.id,
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          sender: lastMessage.sender
        }
      : null,
    unreadCount
  };
}

export async function listAllowedChatContacts(userId) {
  const me = await getUserById(userId);

  if (!me) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  if (me.role === "CUSTOMER") {
    const sellers = await prisma.user.findMany({
      where: {
        role: "SELLER",
        isActive: true
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      },
      orderBy: {
        fullName: "asc"
      }
    });

    return sellers;
  }

  if (me.role === "SELLER") {
    const [customers, admins] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: "CUSTOMER",
          isActive: true,
          orders: {
            some: {
              items: {
                some: {
                  product: {
                    sellerId: me.id
                  }
                }
              }
            }
          }
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        },
        orderBy: {
          fullName: "asc"
        }
      }),
      prisma.user.findMany({
        where: {
          role: "ADMIN",
          isActive: true
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        },
        orderBy: {
          fullName: "asc"
        }
      })
    ]);

    return [...customers, ...admins];
  }

  const sellers = await prisma.user.findMany({
    where: {
      role: "SELLER",
      isActive: true
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true
    },
    orderBy: {
      fullName: "asc"
    }
  });

  return sellers;
}

export async function listConversationsByUser(userId) {
  const conversations = await prisma.conversation.findMany({
    where: {
      members: {
        some: {
          userId
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true
            }
          }
        }
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              role: true
            }
          }
        }
      }
    }
  });

  const withCounts = await Promise.all(
    conversations.map(async (conversation) => {
      const me = conversation.members.find((member) => member.userId === userId);
      const where = {
        conversationId: conversation.id,
        senderId: {
          not: userId
        }
      };

      if (me?.lastReadAt) {
        where.createdAt = { gt: me.lastReadAt };
      }

      const unreadCount = await prisma.message.count({ where });
      return toConversationSummary(conversation, userId, unreadCount);
    })
  );

  return withCounts;
}

export async function createOrGetConversation(currentUserId, payload) {
  const [me, participant] = await Promise.all([
    getUserById(currentUserId),
    getUserById(payload.participantId)
  ]);

  if (!me || !participant || !participant.isActive) {
    const err = new Error("Participant not found");
    err.statusCode = 404;
    throw err;
  }

  if (me.id === participant.id) {
    const err = new Error("Cannot create conversation with yourself");
    err.statusCode = 400;
    throw err;
  }

  if (!isAllowedRolePair(me.role, participant.role)) {
    const err = new Error("Conversation is not allowed for these roles");
    err.statusCode = 403;
    throw err;
  }

  if (payload.orderId) {
    const order = await prisma.order.findUnique({
      where: { id: payload.orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                sellerId: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      throw err;
    }

    const linkedUserIds = new Set([order.userId]);
    for (const item of order.items) {
      if (item.product?.sellerId) {
        linkedUserIds.add(item.product.sellerId);
      }
    }

    const meLinked = me.role === "ADMIN" || linkedUserIds.has(me.id);
    const participantLinked = participant.role === "ADMIN" || linkedUserIds.has(participant.id);

    if (!meLinked || !participantLinked) {
      const err = new Error("Participants are not linked to this order");
      err.statusCode = 403;
      throw err;
    }
  }

  const participantIds = [currentUserId, payload.participantId];

  const existing = await prisma.conversation.findFirst({
    where: {
      orderId: payload.orderId || null,
      members: {
        some: {
          userId: currentUserId
        }
      },
      AND: [
        {
          members: {
            some: {
              userId: payload.participantId
            }
          }
        },
        {
          members: {
            every: {
              userId: {
                in: participantIds
              }
            }
          }
        }
      ]
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true
            }
          }
        }
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              role: true
            }
          }
        }
      }
    }
  });

  if (existing) {
    return toConversationSummary(existing, currentUserId, 0);
  }

  const created = await prisma.conversation.create({
    data: {
      type: payload.orderId ? "ORDER_SUPPORT" : "DIRECT",
      orderId: payload.orderId,
      createdById: currentUserId,
      members: {
        createMany: {
          data: participantIds.map((userId) => ({ userId }))
        }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true
            }
          }
        }
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              role: true
            }
          }
        }
      }
    }
  });

  emitUsersEvent(participantIds, "chat:conversation-updated", {
    conversationId: created.id
  });

  return toConversationSummary(created, currentUserId, 0);
}

export async function listMessagesByConversation(userId, conversationId, query) {
  await assertConversationAccess(userId, conversationId);

  const where = {
    conversationId
  };

  if (query.before) {
    where.createdAt = {
      lt: new Date(query.before)
    };
  }

  const messages = await prisma.message.findMany({
    where,
    take: query.limit,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          role: true
        }
      }
    }
  });

  return messages.reverse().map((message) => ({
    id: message.id,
    conversationId: message.conversationId,
    content: message.content,
    createdAt: message.createdAt,
    sender: message.sender
  }));
}

export async function sendMessageToConversation(userId, conversationId, content) {
  await assertConversationAccess(userId, conversationId);

  const payload = await prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        conversationId,
        senderId: userId,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        }
      }
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date()
      }
    });

    await tx.conversationMember.updateMany({
      where: {
        conversationId,
        userId
      },
      data: {
        lastReadAt: new Date()
      }
    });

    const members = await tx.conversationMember.findMany({
      where: {
        conversationId
      },
      select: {
        userId: true
      }
    });

    return {
      message,
      memberIds: members.map((member) => member.userId)
    };
  });

  const messageData = {
    id: payload.message.id,
    conversationId: payload.message.conversationId,
    content: payload.message.content,
    createdAt: payload.message.createdAt,
    sender: payload.message.sender
  };

  emitConversationMessage(conversationId, messageData);
  emitUsersEvent(payload.memberIds, "chat:conversation-updated", {
    conversationId
  });

  return messageData;
}

export async function markConversationRead(userId, conversationId) {
  await assertConversationAccess(userId, conversationId);

  await prisma.conversationMember.updateMany({
    where: {
      conversationId,
      userId
    },
    data: {
      lastReadAt: new Date()
    }
  });

  return {
    conversationId,
    markedRead: true
  };
}

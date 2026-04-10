import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import PageShell from "../components/common/PageShell";
import {
  createConversation,
  escalateConversation,
  fetchChatContacts,
  fetchContactChatOrders,
  fetchConversationMessages,
  fetchMyConversations,
  markConversationRead,
  sendConversationMessage
} from "../lib/chatApi";
import { getAccessToken, getAuthUser } from "../lib/authStorage";
import { getChatSocket } from "../lib/chatSocket";

function formatConversationTitle(conversation, authUser) {
  if (conversation.orderId) {
    return `Order Support: ${conversation.orderId.slice(0, 8)}`;
  }

  if (conversation.counterpart?.fullName) {
    return conversation.counterpart.fullName;
  }

  const fallback = conversation.members.find((member) => member.id !== authUser?.id);
  return fallback?.fullName || "Conversation";
}

export default function ChatPage() {
  const queryClient = useQueryClient();
  const authUser = getAuthUser();
  const token = getAccessToken();
  const [searchParams] = useSearchParams();

  const [selectedConversationId, setSelectedConversationId] = useState(searchParams.get("conversationId") || "");
  const [newParticipantId, setNewParticipantId] = useState(searchParams.get("participantId") || "");
  const [newOrderId, setNewOrderId] = useState(searchParams.get("orderId") || "");
  const [messageDraft, setMessageDraft] = useState("");
  const [formError, setFormError] = useState("");
  const [escalationFeedback, setEscalationFeedback] = useState("");
  const [conversationFilter, setConversationFilter] = useState("all");

  const conversationsQuery = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: fetchMyConversations
  });

  const contactsQuery = useQuery({
    queryKey: ["chat-contacts"],
    queryFn: fetchChatContacts
  });

  const conversations = conversationsQuery.data || [];
  const filteredConversations = conversations.filter((conversation) => {
    if (conversationFilter === "order-linked") {
      return Boolean(conversation.orderId);
    }

    if (conversationFilter === "open-escalations") {
      const roles = new Set((conversation.members || []).map((member) => member.role));
      return Boolean(conversation.orderId) && roles.has("CUSTOMER") && roles.has("SELLER") && roles.has("ADMIN");
    }

    return true;
  });
  const activeConversationId = selectedConversationId || filteredConversations[0]?.id || "";

  const selectedConversation = filteredConversations.find((item) => item.id === activeConversationId) || null;
  const contacts = contactsQuery.data || [];
  const hasSelectedContact = contacts.some((contact) => contact.id === newParticipantId);

  const contactOrdersQuery = useQuery({
    queryKey: ["chat-contact-orders", newParticipantId],
    queryFn: () => fetchContactChatOrders(newParticipantId),
    enabled: Boolean(newParticipantId)
  });

  const availableOrders = contactOrdersQuery.data || [];

  const messagesQuery = useQuery({
    queryKey: ["chat-messages", activeConversationId],
    queryFn: () => fetchConversationMessages(activeConversationId, { limit: 50 }),
    enabled: Boolean(activeConversationId)
  });

  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: (data) => {
      setSelectedConversationId(data.id);
      setNewParticipantId("");
      setNewOrderId("");
      setFormError("");
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
    onError: (error) => {
      setFormError(error?.response?.data?.message || "Could not create conversation.");
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }) => sendConversationMessage(conversationId, content),
    onSuccess: () => {
      setMessageDraft("");
      queryClient.invalidateQueries({ queryKey: ["chat-messages", activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    }
  });

  const markReadMutation = useMutation({
    mutationFn: markConversationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    }
  });

  const escalationMutation = useMutation({
    mutationFn: escalateConversation,
    onSuccess: (data) => {
      setEscalationFeedback(data.escalated ? "Escalation sent to admin." : "Conversation already has admin.");
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
    onError: (error) => {
      setEscalationFeedback(error?.response?.data?.message || "Could not escalate this conversation.");
    }
  });

  const memberRoles = new Set((selectedConversation?.members || []).map((member) => member.role));
  const canEscalateConversation = Boolean(
    selectedConversation &&
    (authUser?.role === "CUSTOMER" || authUser?.role === "SELLER") &&
    memberRoles.has("CUSTOMER") &&
    memberRoles.has("SELLER") &&
    !memberRoles.has("ADMIN")
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = getChatSocket(token);

    const onConversationUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    };

    const onMessage = (payload) => {
      if (payload.conversationId === activeConversationId) {
        queryClient.invalidateQueries({ queryKey: ["chat-messages", activeConversationId] });
      }
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    };

    socket.on("chat:conversation-updated", onConversationUpdate);
    socket.on("chat:message", onMessage);

    return () => {
      socket.off("chat:conversation-updated", onConversationUpdate);
      socket.off("chat:message", onMessage);
    };
  }, [activeConversationId, queryClient, token]);

  useEffect(() => {
    if (!activeConversationId || !token) {
      return;
    }

    const socket = getChatSocket(token);
    socket.emit("chat:join", activeConversationId);

    markReadMutation.mutate(activeConversationId);

    return () => {
      socket.emit("chat:leave", activeConversationId);
    };
  }, [activeConversationId, markReadMutation, token]);

  function onCreateConversation(event) {
    event.preventDefault();
    setFormError("");

    if (!newParticipantId.trim()) {
      setFormError("Please select a chat contact.");
      return;
    }

    createConversationMutation.mutate({
      participantId: newParticipantId.trim(),
      orderId: newOrderId.trim() || undefined
    });
  }

  function onSendMessage(event) {
    event.preventDefault();

    const content = messageDraft.trim();
    if (!content || !activeConversationId) {
      return;
    }

    sendMessageMutation.mutate({
      conversationId: activeConversationId,
      content
    });
  }

  return (
    <PageShell title="Live Chat">
      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="wm-card p-4">
          <h3 className="m-0 text-lg text-slate-900">Start or Continue a Conversation</h3>
          <p className="m-0 mt-1 text-xs text-slate-600">
            Chat is role-aware and order-aware. Create a thread with a contact, optionally linked to an order.
          </p>
          <form className="mt-3 grid gap-2" onSubmit={onCreateConversation}>
            <select
              className="wm-input"
              value={newParticipantId}
              onChange={(event) => {
                setNewParticipantId(event.target.value);
                setNewOrderId("");
              }}
              required
            >
              <option value="">Select contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.fullName} ({contact.role})
                </option>
              ))}
              {!hasSelectedContact && newParticipantId ? (
                <option value={newParticipantId}>Selected from link ({newParticipantId.slice(0, 8)})</option>
              ) : null}
            </select>
            <select
              className="wm-input"
              value={newOrderId}
              onChange={(event) => setNewOrderId(event.target.value)}
              disabled={!newParticipantId || contactOrdersQuery.isPending}
            >
              <option value="">No specific order</option>
              {availableOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  #{order.id.slice(0, 8)} | {order.status} | Rs. {order.totalAmount.toFixed(2)} | {order.itemCount} items
                </option>
              ))}
            </select>
            {contactOrdersQuery.isPending ? <p className="m-0 text-xs text-slate-500">Loading related orders...</p> : null}
            {contactOrdersQuery.isError ? (
              <div>
                <p className="m-0 text-xs text-rose-600">Could not load related orders.</p>
                <button className="wm-btn-secondary mt-1 px-2 py-1 text-xs" type="button" onClick={() => contactOrdersQuery.refetch()}>
                  Retry
                </button>
              </div>
            ) : null}
            {contactsQuery.isPending ? <p className="m-0 text-xs text-slate-500">Loading contacts...</p> : null}
            {contactsQuery.isError ? (
              <div>
                <p className="m-0 text-xs text-rose-600">Could not load contacts.</p>
                <button className="wm-btn-secondary mt-1 px-2 py-1 text-xs" type="button" onClick={() => contactsQuery.refetch()}>
                  Retry
                </button>
              </div>
            ) : null}
            {formError ? <p className="m-0 text-xs text-rose-600">{formError}</p> : null}
            <button className="wm-btn-primary" type="submit" disabled={createConversationMutation.isPending}>
              {createConversationMutation.isPending ? "Creating..." : "Create / Open"}
            </button>
          </form>

          <h4 className="m-0 mt-5 text-base text-slate-900">Conversation Inbox</h4>
          <select
            className="wm-input mt-2"
            value={conversationFilter}
            onChange={(event) => {
              setConversationFilter(event.target.value);
              setSelectedConversationId("");
            }}
          >
            <option value="all">All Conversations</option>
            <option value="order-linked">Order-linked only</option>
            {(authUser?.role === "SELLER" || authUser?.role === "ADMIN") ? (
              <option value="open-escalations">Open escalations</option>
            ) : null}
          </select>
          {conversationsQuery.isPending ? <p className="wm-muted mt-2">Loading conversations...</p> : null}
          {conversationsQuery.isError ? (
            <div className="mt-2">
              <p className="m-0 text-sm text-rose-600">Could not load conversations.</p>
              <button className="wm-btn-secondary mt-2 px-3 py-1 text-xs" type="button" onClick={() => conversationsQuery.refetch()}>
                Retry
              </button>
            </div>
          ) : null}
          {!conversationsQuery.isPending && !conversationsQuery.isError && filteredConversations.length === 0 ? (
            <p className="wm-muted mt-2">No conversations found for this filter.</p>
          ) : null}

          <div className="mt-2 grid gap-2 max-h-[430px] overflow-y-auto pr-1">
            {filteredConversations.map((conversation) => (
              <button
                className={activeConversationId === conversation.id
                  ? "rounded-lg border border-slate-900 bg-slate-900 p-3 text-left text-white"
                  : "rounded-lg border border-slate-200 bg-white p-3 text-left text-slate-800"}
                key={conversation.id}
                type="button"
                onClick={() => setSelectedConversationId(conversation.id)}
              >
                <p className="m-0 text-sm font-semibold">{formatConversationTitle(conversation, authUser)}</p>
                <p className={activeConversationId === conversation.id ? "m-0 mt-1 text-xs text-slate-200" : "m-0 mt-1 text-xs text-slate-600"}>
                  {conversation.lastMessage?.content || "No messages yet"}
                </p>
                {conversation.unreadCount > 0 ? (
                  <span className="mt-2 inline-block rounded-full bg-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                    {conversation.unreadCount} new
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </aside>

        <article className="wm-panel flex min-h-[560px] flex-col p-4">
          {selectedConversation ? (
            <>
              <div className="border-b border-slate-200 pb-3">
                <h3 className="m-0 text-xl text-slate-900">{formatConversationTitle(selectedConversation, authUser)}</h3>
                <p className="m-0 mt-1 text-xs text-slate-600">
                  Members: {selectedConversation.members.map((member) => member.fullName).join(", ")}
                </p>
                {canEscalateConversation ? (
                  <div className="mt-2">
                    <button
                      className="wm-btn-secondary px-3 py-1 text-xs"
                      type="button"
                      disabled={escalationMutation.isPending}
                      onClick={() => {
                        setEscalationFeedback("");
                        escalationMutation.mutate(selectedConversation.id);
                      }}
                    >
                      {escalationMutation.isPending ? "Escalating..." : "Escalate To Admin"}
                    </button>
                  </div>
                ) : null}
                {memberRoles.has("ADMIN") ? <p className="m-0 mt-2 text-xs text-emerald-700">Admin is already in this conversation.</p> : null}
                {escalationFeedback ? <p className="m-0 mt-2 text-xs text-slate-700">{escalationFeedback}</p> : null}
              </div>

              <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">
                {messagesQuery.isPending ? <p className="wm-muted">Loading messages...</p> : null}
                {messagesQuery.isError ? (
                  <div>
                    <p className="m-0 text-sm text-rose-600">Could not load messages.</p>
                    <button className="wm-btn-secondary mt-2 px-3 py-1 text-xs" type="button" onClick={() => messagesQuery.refetch()}>
                      Retry
                    </button>
                  </div>
                ) : null}
                {!messagesQuery.isPending && !messagesQuery.isError && (messagesQuery.data || []).length === 0 ? (
                  <p className="wm-muted">No messages yet. Start the conversation below.</p>
                ) : null}

                <div className="grid gap-2">
                  {(messagesQuery.data || []).map((message) => {
                    const isMine = message.sender.id === authUser?.id;
                    return (
                      <div
                        className={isMine
                          ? "ml-auto max-w-[78%] rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
                          : "mr-auto max-w-[78%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900"}
                        key={message.id}
                      >
                        <p className="m-0 text-[11px] opacity-75">{message.sender.fullName}</p>
                        <p className="m-0 mt-1">{message.content}</p>
                        <p className="m-0 mt-1 text-[10px] opacity-70">{new Date(message.createdAt).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={onSendMessage}>
                <input
                  className="wm-input flex-1"
                  placeholder="Type your message..."
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                />
                <button className="wm-btn-primary" type="submit" disabled={sendMessageMutation.isPending}>
                  {sendMessageMutation.isPending ? "Sending..." : "Send"}
                </button>
              </form>
            </>
          ) : (
            <p className="wm-muted">Select or create a conversation to start chatting.</p>
          )}
        </article>
      </section>
    </PageShell>
  );
}

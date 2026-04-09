import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import PageShell from "../components/common/PageShell";
import {
  createConversation,
  fetchChatContacts,
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

  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [newParticipantId, setNewParticipantId] = useState(searchParams.get("participantId") || "");
  const [newOrderId, setNewOrderId] = useState(searchParams.get("orderId") || "");
  const [messageDraft, setMessageDraft] = useState("");
  const [formError, setFormError] = useState("");

  const conversationsQuery = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: fetchMyConversations
  });

  const contactsQuery = useQuery({
    queryKey: ["chat-contacts"],
    queryFn: fetchChatContacts
  });

  const conversations = conversationsQuery.data || [];
  const activeConversationId = selectedConversationId || conversations[0]?.id || "";

  const selectedConversation = conversations.find((item) => item.id === activeConversationId) || null;
  const contacts = contactsQuery.data || [];
  const hasSelectedContact = contacts.some((contact) => contact.id === newParticipantId);

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
      <section className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="wm-card p-4">
          <h3 className="m-0 text-lg text-slate-900">Start Conversation</h3>
          <p className="m-0 mt-1 text-xs text-slate-600">
            Customer can chat with seller. Seller can chat with customer and admin. Admin can chat with seller.
          </p>
          <form className="mt-3 grid gap-2" onSubmit={onCreateConversation}>
            <select
              className="wm-input"
              value={newParticipantId}
              onChange={(event) => setNewParticipantId(event.target.value)}
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
            <input
              className="wm-input"
              placeholder="Order ID (optional)"
              value={newOrderId}
              onChange={(event) => setNewOrderId(event.target.value)}
            />
            {contactsQuery.isPending ? <p className="m-0 text-xs text-slate-500">Loading contacts...</p> : null}
            {contactsQuery.isError ? <p className="m-0 text-xs text-rose-600">Could not load contacts.</p> : null}
            {formError ? <p className="m-0 text-xs text-rose-600">{formError}</p> : null}
            <button className="wm-btn-primary" type="submit" disabled={createConversationMutation.isPending}>
              {createConversationMutation.isPending ? "Creating..." : "Create / Open"}
            </button>
          </form>

          <h4 className="m-0 mt-5 text-base text-slate-900">My Conversations</h4>
          {conversationsQuery.isPending ? <p className="wm-muted mt-2">Loading conversations...</p> : null}
          {conversationsQuery.isError ? <p className="mt-2 text-sm text-rose-600">Could not load conversations.</p> : null}

          <div className="mt-2 grid gap-2">
            {(conversationsQuery.data || []).map((conversation) => (
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
              </div>

              <div className="mt-3 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
                {messagesQuery.isPending ? <p className="wm-muted">Loading messages...</p> : null}
                {messagesQuery.isError ? <p className="text-sm text-rose-600">Could not load messages.</p> : null}

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

              <form className="mt-3 flex gap-2" onSubmit={onSendMessage}>
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

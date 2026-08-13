import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/auth';

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  model: string;
}

interface Message {
  _id: string;
  senderId: {
    _id: string;
    fullName?: string;
    name?: string;
  };
  senderModel: string;
  receiverId: {
    _id: string;
    fullName?: string;
    name?: string;
  };
  receiverModel: string;
  message: string;
  createdAt: string;
}

export default function MessageScreen() {
  const { token, user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const apiBase = process.env.EXPO_PUBLIC_API_URL || 'http://10.59.129.232:5009/api';
  const socketUrl = apiBase.replace('/api', '');

  // 1. Fetch Contacts
  useEffect(() => {
    if (!token) return;

    const fetchContacts = async () => {
      try {
        const res = await fetch(`${apiBase}/messages/contacts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
          setFilteredContacts(data);
        }
      } catch (err) {
        console.error('Error fetching contacts in mobile:', err);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, [token, apiBase]);

  // 2. Filter Contacts on Search
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredContacts(
      contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.role.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, contacts]);

  // 3. Fetch Chat History when activeContact changes
  useEffect(() => {
    if (!token || !activeContact) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch(`${apiBase}/messages/history/${activeContact.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error('Error fetching history in mobile:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [activeContact, token, apiBase]);

  // 4. Setup Socket.io
  useEffect(() => {
    if (!user?.id || !activeContact) return;

    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Mobile socket connected');
      newSocket.emit('register', user.id);
    });

    newSocket.on('newMessage', (msg: Message) => {
      const msgSenderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
      const msgReceiverId = typeof msg.receiverId === 'object' ? msg.receiverId._id : msg.receiverId;

      if (
        (msgSenderId === user.id && msgReceiverId === activeContact.id) ||
        (msgSenderId === activeContact.id && msgReceiverId === user.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id, activeContact, socketUrl]);

  // 5. Send Message Action
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeContact || !token) return;

    try {
      const res = await fetch(`${apiBase}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: activeContact.id,
          receiverModel: activeContact.model,
          message: inputMessage.trim(),
        }),
      });

      if (res.ok) {
        setInputMessage('');
      } else {
        console.error('Failed to send message via mobile REST');
      }
    } catch (err) {
      console.error('Error sending message in mobile:', err);
    }
  };

  // Render a Single Contact Row
  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity style={styles.chatRow} onPress={() => setActiveContact(item)}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatRole}>{item.role}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.email}
        </Text>
      </View>

      <Ionicons name="chevron-forward-outline" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  // Render a Single Chat Message
  const renderMessageItem = ({ item }: { item: Message }) => {
    const senderIdStr = typeof item.senderId === 'object' ? item.senderId._id : item.senderId;
    const isMe = senderIdStr === user?.id;

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowRight : styles.messageRowLeft]}>
        <View style={[styles.messageBubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={[styles.messageText, isMe ? styles.textRight : styles.textLeft]}>
            {item.message}
          </Text>
          <Text style={[styles.timeText, isMe ? styles.timeRight : styles.timeLeft]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  // If in active chat
  if (activeContact) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header */}
          <View style={styles.chatHeaderContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => setActiveContact(null)}>
              <Ionicons name="arrow-back-outline" size={24} color="#0F172A" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{activeContact.name}</Text>
              <Text style={styles.headerSubtitle}>{activeContact.role}</Text>
            </View>
          </View>

          {/* History */}
          {loadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.chatListContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}

          {/* Message Input Box */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputMessage.trim()}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Otherwise, render Contacts List
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            placeholder="Search contacts..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Contacts List */}
        {loadingContacts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            renderItem={renderContactItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No contacts found</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#2563eb',
    fontSize: 18,
    fontWeight: '700',
  },
  chatDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  chatName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  chatRole: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
  },
  chatHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 1,
    textTransform: 'capitalize',
  },
  chatListContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleLeft: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopLeftRadius: 0,
  },
  bubbleRight: {
    backgroundColor: '#2563eb',
    borderTopRightRadius: 0,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textLeft: {
    color: '#0F172A',
  },
  textRight: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  timeLeft: {
    color: '#94A3B8',
  },
  timeRight: {
    color: '#BFDBFE',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    paddingHorizontal: 18,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    fontSize: 14,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
});

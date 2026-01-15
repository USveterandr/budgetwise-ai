import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { geminiService, ChatMessage } from '../services/geminiService';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../AuthContext';
import { cloudflare } from '../app/lib/cloudflare';
import { tokenCache } from '../utils/tokenCache';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export function AiAdvisor() {
  const { userProfile, currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Real Financial Data State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [netWorth, setNetWorth] = useState(0);
  const [expenses, setExpenses] = useState(0);

  useEffect(() => {
    loadFinancialData();
  }, [currentUser]);

  const loadFinancialData = async () => {
       if (!currentUser?.uid) return;
       try {
           const token = await tokenCache.getToken("budgetwise_jwt_token");
           if (token) {
               const txs = await cloudflare.getTransactions(currentUser.uid, token);
               if (Array.isArray(txs)) {
                   setTransactions(txs);
                   // Calculate metrics
                   const totalExp = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
                   const totalInc = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0);
                   setExpenses(totalExp);
                   setNetWorth(totalInc - totalExp); // Simplified math

                   // Initial Message after loading data
                   if (messages.length === 0) {
                        setMessages([{
                            id: 'welcome',
                            role: 'model',
                            text: `Hello ${userProfile?.name?.split(' ')[0] || ''}! I've analyzed your ${txs.length} transactions. Your current flow shows $${totalExp.toLocaleString()} in recent expenses. How can I help you optimize your wealth today?`,
                            timestamp: new Date()
                        }]);
                   }
               }
           }
       } catch (e) {
           console.error("Failed to load generic data for AI", e);
       }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const recentTx = transactions.slice(0, 5).map(t => `${t.date?.split('T')[0]}: ${t.description} ($${t.amount})`).join(', ');
      
      const userContext = `
        User Profile: ${JSON.stringify(userProfile)}.
        Recent Metrics: Net Worth ~$${netWorth}, Monthly Income: $${userProfile?.monthly_income || 0}, Recent Expenses: $${expenses}.
        Recent Transactions: ${recentTx}
      `;
      
      const history: ChatMessage[] = messages.map(m => ({ role: m.role, parts: m.text }));
      
      const responseText = await geminiService.getFinancialAdvice(history, userContext);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error", error);
      const errorMsg: Message = {
        id: 'error',
        role: 'model',
        text: "I'm having trouble connecting to the financial knowledge base right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.role === 'user' ? styles.userMessage : styles.aiMessage]}>
      <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, item.role === 'user' ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>AI Budget Advisor</Text>
            <Text style={styles.headerSubtitle}>Powered by Gemini</Text>
          </View>
          <LinearGradient 
            colors={['rgba(234, 179, 8, 0.2)', 'rgba(202, 138, 4, 0.2)']} 
            style={styles.proBadge}
          >
            <Text style={styles.proBadgeText}>PRO FEATURE</Text>
          </LinearGradient>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primaryLight} />
          </View>
        )}

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              placeholder="Ask for advice on your budget..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={1}
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, !input.trim() || isLoading ? styles.sendButtonDisabled : null]}
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <LinearGradient 
                colors={[Colors.primary, Colors.secondary]} 
                style={styles.sendButtonGradient}
              >
                <Ionicons name="send" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  proBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  proBadgeText: {
    color: '#EAB308',
    fontSize: 10,
    fontWeight: '800',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  messageContainer: {
    marginBottom: 20,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
    fontWeight: '500',
  },
  aiText: {
    color: '#F1F5F9',
    fontWeight: '400',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: '#FFF',
    maxHeight: 120,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sendButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
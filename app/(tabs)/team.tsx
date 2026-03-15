import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, TextInput } from 'react-native';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export default function TeamScreen() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      joinedAt: '2025-11-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'member',
      joinedAt: '2025-11-20'
    }
  ]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'member' | 'viewer'>('member');

  const handleInviteMember = () => {
    if (!newMemberEmail) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Check if user is on Business plan or higher
    const eligiblePlans = ['Business', 'Enterprise'];
    if (!user || !eligiblePlans.includes(user.plan)) {
      Alert.alert(
        'Upgrade Required',
        'Team collaboration is only available on Business and Enterprise plans. Please upgrade your subscription.',
        [{ text: 'Upgrade', onPress: () => {} }] // Would navigate to subscription page
      );
      return;
    }

    // In a real app, this would send an invitation email
    const newMember: TeamMember = {
      id: `member_${Date.now()}`,
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: newMemberRole,
      joinedAt: new Date().toISOString().split('T')[0]
    };

    setTeamMembers(prev => [...prev, newMember]);
    setNewMemberEmail('');
    Alert.alert('Success', `Invitation sent to ${newMemberEmail}`);
  };

  const handleRemoveMember = (memberId: string) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from your team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setTeamMembers(prev => prev.filter(member => member.id !== memberId));
            Alert.alert('Success', 'Member removed from team');
          }
        }
      ]
    );
  };

  const handleChangeRole = (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
    Alert.alert('Success', 'Member role updated');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Team Management</Text>
        <Text style={styles.subtitle}>Collaborate with your team members</Text>

        <Card style={styles.inviteCard}>
          <Text style={styles.cardTitle}>Invite Team Members</Text>
          <Text style={styles.cardDescription}>
            Invite colleagues to collaborate on your financial data
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="colleague@company.com"
              value={newMemberEmail}
              onChangeText={setNewMemberEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleSelector}>
              <Button
                title="Member"
                variant={newMemberRole === 'member' ? 'primary' : 'outline'}
                onPress={() => setNewMemberRole('member')}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Viewer"
                variant={newMemberRole === 'viewer' ? 'primary' : 'outline'}
                onPress={() => setNewMemberRole('viewer')}
                style={{ flex: 1 }}
              />
            </View>
          </View>
          
          <Button
            title="Send Invitation"
            onPress={handleInviteMember}
            style={styles.inviteButton}
          />
        </Card>

        <Card style={styles.membersCard}>
          <Text style={styles.cardTitle}>Team Members</Text>
          <Text style={styles.membersCount}>{teamMembers.length} members</Text>
          
          {teamMembers.map(member => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.memberInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
              </View>
              
              <View style={styles.memberActions}>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{member.role}</Text>
                </View>
                <Button
                  title="Remove"
                  variant="outline"
                  size="small"
                  onPress={() => handleRemoveMember(member.id)}
                  style={{ minWidth: 80 }}
                />
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Team Collaboration Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>• Shared dashboards and reports</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>• Real-time financial data sync</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>• Role-based access control</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>• Audit trails and activity logs</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DashboardColors.background,
  },
  scroll: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: DashboardColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: DashboardColors.textSecondary,
    marginBottom: 24,
  },
  inviteCard: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DashboardColors.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DashboardColors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: DashboardColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: DashboardColors.text,
    backgroundColor: DashboardColors.surface,
  },
  roleSelector: {
    flexDirection: 'row',
  },
  roleButton: {
    flex: 1,
  },
  inviteButton: {
    marginTop: 8,
  },
  membersCard: {
    marginBottom: 20,
  },
  membersCount: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
    marginBottom: 16,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DashboardColors.border,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: DashboardColors.text,
  },
  memberEmail: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    backgroundColor: DashboardColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: DashboardColors.textSecondary,
    textTransform: 'capitalize',
  },
  removeButton: {
    minWidth: 80,
  },
  infoCard: {},
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DashboardColors.text,
    marginBottom: 12,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {},
  featureText: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
    lineHeight: 20,
  },
});
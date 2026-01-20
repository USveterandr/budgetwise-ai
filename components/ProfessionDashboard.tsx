import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Card } from './ui/Card';

interface ProfessionDashboardProps {
  industry: string;
}

type Action = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: string;
  color: string;
};

type ProfessionConfig = {
  title: string;
  actions: Action[];
  tips: string[];
};

const DEFAULT_CONFIG: ProfessionConfig = {
  title: "Professional Workspace",
  actions: [
    { label: "Office Supplies", icon: "print", category: "Office", color: "#3B82F6" },
    { label: "Software", icon: "laptop-outline", category: "Software", color: "#8B5CF6" },
    { label: "Travel", icon: "airplane", category: "Travel", color: "#F59E0B" },
  ],
  tips: ["Track every business expense to maximize tax deductions."]
};

const INDUSTRY_CONFIGS: Record<string, ProfessionConfig> = {
  "Truck Driver": {
    title: "Logistics Command",
    actions: [
      { label: "Fuel", icon: "speedometer", category: "Fuel", color: "#EF4444" },
      { label: "Maintenance", icon: "build", category: "Maintenance", color: "#F59E0B" },
      { label: "Meals", icon: "restaurant", category: "Meals", color: "#10B981" },
    ],
    tips: ["Log odometer readings with every fuel stop.", "Keep receipts for all per diem meals."]
  },
  "Plumber": {
    title: "Trade Toolkit",
    actions: [
      { label: "Materials", icon: "hammer", category: "Materials", color: "#F97316" },
      { label: "Tools", icon: "construct", category: "Tools", color: "#6366F1" },
      { label: "Job Supplies", icon: "cart", category: "Supplies", color: "#10B981" },
    ],
    tips: ["Separate billable materials from overhead tools.", "Track mileage between job sites."]
  },
  "Electrician": {
    title: "Circuit Control",
    actions: [
      { label: "Wire/Parts", icon: "flash", category: "Materials", color: "#EAB308" },
      { label: "Tools", icon: "construct", category: "Tools", color: "#6366F1" },
      { label: "Safety Gear", icon: "shield-checkmark", category: "Safety", color: "#EF4444" },
    ],
    tips: ["Bulk buy copper when prices dip.", "Document safety gear for compliance."]
  },
  "Real Estate Agent": {
    title: "Realty Hub",
    actions: [
      { label: "Marketing", icon: "megaphone", category: "Marketing", color: "#EC4899" },
      { label: "Client Ent.", icon: "wine", category: "Entertainment", color: "#8B5CF6" },
      { label: "Listing Fees", icon: "home", category: "Fees", color: "#3B82F6" },
    ],
    tips: ["Set aside 30% of every commission for taxes.", "Track mileage for all showings."]
  },
  "Software Developer": {
    title: "Dev Console",
    actions: [
      { label: "Subscriptions", icon: "cloud", category: "Software", color: "#3B82F6" },
      { label: "Hardware", icon: "desktop", category: "Hardware", color: "#64748B" },
      { label: "Courses", icon: "school", category: "Education", color: "#10B981" },
    ],
    tips: ["Expense your home office internet portion.", "Automate recurring server costs."]
  },
  "Construction": {
    title: "Site Manager",
    actions: [
      { label: "Materials", icon: "cube", category: "Materials", color: "#F97316" },
      { label: "Labor", icon: "people", category: "Labor", color: "#EF4444" },
      { label: "Equipment", icon: "car", category: "Equipment", color: "#F59E0B" },
    ],
    tips: ["Track equipment rental days carefully.", "Monitor material waste per project."]
  },
  "Restaurant Owner": {
    title: "Kitchen Ops",
    actions: [
      { label: "Food Cost", icon: "nutrition", category: "COGS", color: "#EF4444" },
      { label: "Labor", icon: "people", category: "Labor", color: "#3B82F6" },
      { label: "Supplies", icon: "basket", category: "Supplies", color: "#10B981" },
    ],
    tips: ["Calculate food cost percentage daily.", "Inventory high-value items weekly."]
  },
  "Consultant": {
    title: "Consulting Suite",
    actions: [
      { label: "Travel", icon: "airplane", category: "Travel", color: "#3B82F6" },
      { label: "Software", icon: "laptop", category: "Software", color: "#8B5CF6" },
      { label: "Client Meals", icon: "restaurant", category: "Meals", color: "#F59E0B" },
    ],
    tips: ["Track billable vs. non-billable hours.", "Expense client acquisition costs."]
  },
  "Retail Store": {
    title: "Retail Command",
    actions: [
      { label: "Inventory", icon: "pricetag", category: "Inventory", color: "#EC4899" },
      { label: "Shipping", icon: "boat", category: "Shipping", color: "#3B82F6" },
      { label: "Packaging", icon: "gift", category: "Supplies", color: "#10B981" },
    ],
    tips: ["Monitor inventory turnover rates.", "Track seasonal shipping cost spikes."]
  },
  "Landscaping": {
    title: "Grounds Control",
    actions: [
      { label: "Fuel", icon: "speedometer", category: "Fuel", color: "#EF4444" },
      { label: "Equipment", icon: "leaf", category: "Equipment", color: "#10B981" },
      { label: "Materials", icon: "flower", category: "Materials", color: "#F59E0B" },
    ],
    tips: ["Service mowers during off-season.", "Bulk buy mulch/fertilizer early."]
  },
  "Auto Mechanic": {
    title: "Garage Ops",
    actions: [
      { label: "Parts", icon: "cog", category: "Parts", color: "#64748B" },
      { label: "Tools", icon: "construct", category: "Tools", color: "#EF4444" },
      { label: "Shop Supplies", icon: "water", category: "Supplies", color: "#3B82F6" },
    ],
    tips: ["Track core returns for refunds.", "Monitor shop supply usage."]
  },
  "Graphic Designer": {
    title: "Creative Studio",
    actions: [
      { label: "Assets", icon: "images", category: "Assets", color: "#EC4899" },
      { label: "Software", icon: "color-palette", category: "Software", color: "#8B5CF6" },
      { label: "Hardware", icon: "desktop", category: "Hardware", color: "#64748B" },
    ],
    tips: ["Expense font and stock photo licenses.", "Track freelance platform fees."]
  },
  "Insurance Agent": {
    title: "Agency Hub",
    actions: [
      { label: "Leads", icon: "people", category: "Marketing", color: "#10B981" },
      { label: "Licensing", icon: "document-text", category: "Fees", color: "#64748B" },
      { label: "Office", icon: "business", category: "Office", color: "#3B82F6" },
    ],
    tips: ["Track cost per lead acquisition.", "Expense continuing education credits."]
  }
};

export function ProfessionDashboard({ industry }: ProfessionDashboardProps) {
  const router = useRouter();
  const config = INDUSTRY_CONFIGS[industry] || DEFAULT_CONFIG;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{config.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{industry}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
        {config.actions.map((action, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.actionBtn}
            onPress={() => router.push({
              pathname: '/add-transaction' as any,
              params: { category: action.category }
            })}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.actionGradient}
            >
              <View style={[styles.iconCircle, { backgroundColor: `${action.color}20` }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionSub}>+ Add Expense</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Card style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Ionicons name="bulb" size={18} color={Colors.primary} />
          <Text style={styles.tipTitle}>Pro Tip</Text>
        </View>
        <Text style={styles.tipText}>{config.tips[0]}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  actionsScroll: {
    gap: 12,
    paddingRight: 20,
  },
  actionBtn: {
    width: 110,
    height: 110,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 13,
    marginTop: 8,
  },
  actionSub: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
  tipCard: {
    marginTop: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipTitle: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  tipText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});

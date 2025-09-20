
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { useSupabasePayments } from '../../hooks/useSupabasePayments';

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { getDashboardStats, refreshPayments } = useSupabasePayments();
  const [refreshing, setRefreshing] = useState(false);

  const stats = getDashboardStats();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPayments();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="bell" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Aujourd'hui"
            value={formatCurrency(stats.totalEncaisseAujourdhui)}
            icon="dollar-sign"
            color={colors.success}
          />
          <StatCard
            title="Cette semaine"
            value={formatCurrency(stats.totalEncaisseSemaine)}
            icon="trending-up"
            color={colors.primary}
          />
          <StatCard
            title="Ce mois"
            value={formatCurrency(stats.totalEncaisseMois)}
            icon="calendar"
            color={colors.warning}
          />
          <StatCard
            title="Paiements"
            value={stats.nombrePaiements.toString()}
            icon="credit-card"
            color={colors.info}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut des élèves</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <Text style={styles.statusLabel}>Élèves soldés</Text>
              </View>
              <Text style={styles.statusValue}>
                {formatPercentage(stats.pourcentageElevesSoldes)}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: colors.error }]} />
                <Text style={styles.statusLabel}>Élèves non soldés</Text>
              </View>
              <Text style={styles.statusValue}>
                {formatPercentage(100 - stats.pourcentageElevesSoldes)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top classes par recouvrement</Text>
          {stats.topClassesRecouvrement.map((classe, index) => (
            <View key={classe.classe} style={styles.classItem}>
              <View style={styles.classRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{classe.classe}</Text>
                <Text style={styles.classAmount}>
                  {formatCurrency(classe.montant)}
                </Text>
              </View>
              <View style={styles.classPercentage}>
                <Text style={styles.percentageText}>
                  {formatPercentage(classe.pourcentage)}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.min(classe.pourcentage, 100)}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="user-plus" size={24} color={colors.primary} />
              <Text style={styles.actionText}>Ajouter élève</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="credit-card" size={24} color={colors.success} />
              <Text style={styles.actionText}>Nouveau paiement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="dollar-sign" size={24} color={colors.warning} />
              <Text style={styles.actionText}>Gérer frais</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="file-text" size={24} color={colors.info} />
              <Text style={styles.actionText}>Rapports</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.text,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  classRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  classAmount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  classPercentage: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 4,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 2,
  },
  quickActions: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;

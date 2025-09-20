
import Icon from '../../components/Icon';
import { colors, commonStyles } from '../../styles/commonStyles';
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatCard from '../../components/StatCard';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useSupabasePayments } from '../../hooks/useSupabasePayments';
import ActionButton from '../../components/ActionButton';

const DashboardScreen = () => {
  const { user, shouldHideDemoData } = useAuth();
  const { getDashboardStats, refreshPayments } = useSupabasePayments();
  const [refreshing, setRefreshing] = useState(false);

  const stats = getDashboardStats();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPayments();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  // Filter demo data if needed
  const filteredTopClasses = shouldHideDemoData 
    ? stats.topClassesRecouvrement.filter(classe => 
        !['6ème A', '5ème B', '4ème C'].includes(classe.classe)
      )
    : stats.topClassesRecouvrement;

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
            <Text style={styles.role}>{user?.role === 'admin' ? 'Administrateur' : 'Caissier'}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={32} color={colors.primary} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Text style={styles.sectionTitle}>Aperçu du jour</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Encaissé aujourd'hui"
              value={formatCurrency(stats.totalEncaisseAujourdhui)}
              icon="cash"
              color={colors.success}
            />
            <StatCard
              title="Paiements"
              value={stats.nombrePaiements.toString()}
              icon="card"
              color={colors.primary}
              subtitle="Total"
            />
          </View>
        </View>

        {/* Weekly & Monthly Stats */}
        <View style={styles.periodStats}>
          <Text style={styles.sectionTitle}>Statistiques périodiques</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Cette semaine"
              value={formatCurrency(stats.totalEncaisseSemaine)}
              icon="calendar"
              color={colors.accent}
            />
            <StatCard
              title="Ce mois"
              value={formatCurrency(stats.totalEncaisseMois)}
              icon="calendar-outline"
              color={colors.warning}
            />
          </View>
        </View>

        {/* Student Status */}
        <View style={styles.studentStatus}>
          <Text style={styles.sectionTitle}>Statut des élèves</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Icon name="school" size={24} color={colors.primary} />
              <Text style={styles.statusTitle}>Élèves soldés</Text>
            </View>
            <Text style={styles.statusPercentage}>
              {formatPercentage(stats.pourcentageElevesSoldes)}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(stats.pourcentageElevesSoldes, 100)}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Top Classes */}
        {filteredTopClasses.length > 0 && (
          <View style={styles.topClasses}>
            <Text style={styles.sectionTitle}>Top classes (recouvrement)</Text>
            {filteredTopClasses.slice(0, 5).map((classe, index) => (
              <View key={classe.classe} style={styles.classItem}>
                <View style={styles.classRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{classe.classe}</Text>
                  <Text style={styles.classAmount}>{formatCurrency(classe.montant)}</Text>
                </View>
                <View style={styles.classPercentage}>
                  <Text style={styles.percentageText}>{formatPercentage(classe.pourcentage)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              title="Nouveau paiement"
              icon="card"
              onPress={() => {
                // Navigate to payments with add modal
                console.log('Navigate to add payment');
              }}
              style={styles.actionButton}
            />
            <ActionButton
              title="Ajouter élève"
              icon="person-add"
              variant="secondary"
              onPress={() => {
                // Navigate to students with add modal
                console.log('Navigate to add student');
              }}
              style={styles.actionButton}
            />
          </View>
          <View style={styles.actionsGrid}>
            <ActionButton
              title="Voir rapports"
              icon="document-text"
              variant="secondary"
              onPress={() => {
                // Navigate to reports
                console.log('Navigate to reports');
              }}
              style={styles.actionButton}
            />
            <ActionButton
              title="Exporter données"
              icon="download"
              variant="secondary"
              onPress={() => {
                // Show export options
                console.log('Show export options');
              }}
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Demo Account Warning */}
        {user && ['admin', 'caissier1'].includes(user.username) && (
          <View style={styles.demoWarning}>
            <Icon name="warning" size={20} color={colors.warning} />
            <Text style={styles.demoWarningText}>
              Vous utilisez un compte de démonstration. Les données affichées sont des exemples.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.backgroundAlt,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: colors.grey,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  quickStats: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  periodStats: {
    marginBottom: 24,
  },
  studentStatus: {
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  statusPercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.grey + '30',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  topClasses: {
    marginBottom: 24,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  classRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  classAmount: {
    fontSize: 14,
    color: colors.grey,
  },
  classPercentage: {
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  quickActions: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  demoWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  demoWarningText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default DashboardScreen;

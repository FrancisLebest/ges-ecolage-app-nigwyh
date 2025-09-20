
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
import { usePayments } from '../../hooks/usePayments';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/StatCard';
import Icon from '../../components/Icon';

export default function DashboardScreen() {
  const { getDashboardStats } = usePayments();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(getDashboardStats());

  const onRefresh = async () => {
    setRefreshing(true);
    // Simuler un délai de rafraîchissement
    setTimeout(() => {
      setStats(getDashboardStats());
      setRefreshing(false);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Encaissé aujourd'hui"
            value={formatCurrency(stats.totalEncaisseAujourdhui)}
            icon="today"
            color="#4CAF50"
          />
          <StatCard
            title="Encaissé ce mois"
            value={formatCurrency(stats.totalEncaisseMois)}
            icon="calendar"
            color="#2196F3"
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="Nombre de paiements"
            value={stats.nombrePaiements.toString()}
            icon="receipt"
            color="#FF9800"
          />
          <StatCard
            title="Élèves soldés"
            value={formatPercentage(stats.pourcentageElevesSoldes)}
            icon="checkmark-circle"
            color="#9C27B0"
          />
        </View>

        {/* Top Classes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Classes - Recouvrement</Text>
          {stats.topClassesRecouvrement.map((classe, index) => (
            <View key={classe.classe} style={styles.classCard}>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{classe.classe}</Text>
                <Text style={styles.classAmount}>
                  {formatCurrency(classe.montant)}
                </Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${classe.pourcentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {formatPercentage(classe.pourcentage)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="add-circle" size={32} color={colors.accent} />
              <Text style={styles.actionText}>Nouveau paiement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="person-add" size={32} color={colors.accent} />
              <Text style={styles.actionText}>Nouvel élève</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="document-text" size={32} color={colors.accent} />
              <Text style={styles.actionText}>Générer rapport</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    color: colors.grey,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  classCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  classInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  classAmount: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.grey + '30',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});

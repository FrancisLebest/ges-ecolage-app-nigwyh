
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../../styles/commonStyles';
import { usePayments } from '../../hooks/usePayments';
import StatCard from '../../components/StatCard';
import Icon from '../../components/Icon';

export default function ReportsScreen() {
  const { getDashboardStats, payments } = usePayments();
  const [selectedPeriod, setSelectedPeriod] = useState<'jour' | 'semaine' | 'mois'>('mois');
  
  const stats = getDashboardStats();

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const getPaymentsByMode = () => {
    const modeStats = payments.reduce((acc, payment) => {
      acc[payment.mode] = (acc[payment.mode] || 0) + payment.montantPaye;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(modeStats).map(([mode, amount]) => ({
      mode,
      amount,
      count: payments.filter(p => p.mode === mode).length
    }));
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'especes': return 'cash';
      case 'cheque': return 'card';
      case 'virement': return 'swap-horizontal';
      case 'mobile': return 'phone-portrait';
      default: return 'wallet';
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'especes': return 'Espèces';
      case 'cheque': return 'Chèque';
      case 'virement': return 'Virement';
      case 'mobile': return 'Mobile Money';
      default: return mode;
    }
  };

  const paymentsByMode = getPaymentsByMode();

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rapports & Analyses</Text>
          <TouchableOpacity style={styles.exportButton}>
            <Icon name="download" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['jour', 'semaine', 'mois'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total encaissé"
            value={formatCurrency(
              selectedPeriod === 'jour' ? stats.totalEncaisseAujourdhui :
              selectedPeriod === 'semaine' ? stats.totalEncaisseSemaine :
              stats.totalEncaisseMois
            )}
            icon="trending-up"
            color="#4CAF50"
          />
          <StatCard
            title="Nombre de paiements"
            value={stats.nombrePaiements.toString()}
            icon="receipt"
            color="#2196F3"
          />
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Répartition par mode de paiement</Text>
          {paymentsByMode.map((item) => (
            <View key={item.mode} style={styles.modeCard}>
              <View style={styles.modeHeader}>
                <View style={styles.modeInfo}>
                  <Icon name={getModeIcon(item.mode)} size={24} color={colors.accent} />
                  <Text style={styles.modeName}>{getModeLabel(item.mode)}</Text>
                </View>
                <Text style={styles.modeAmount}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
              <Text style={styles.modeCount}>
                {item.count} transaction{item.count > 1 ? 's' : ''}
              </Text>
            </View>
          ))}
        </View>

        {/* Top Classes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance par classe</Text>
          {stats.topClassesRecouvrement.map((classe) => (
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
                  {classe.pourcentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Export Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions d&apos;export</Text>
          <View style={styles.exportActions}>
            <TouchableOpacity style={styles.exportActionButton}>
              <Icon name="document-text" size={24} color={colors.accent} />
              <Text style={styles.exportActionText}>Export PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportActionButton}>
              <Icon name="grid" size={24} color={colors.accent} />
              <Text style={styles.exportActionText}>Export Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportActionButton}>
              <Icon name="document" size={24} color={colors.accent} />
              <Text style={styles.exportActionText}>Export CSV</Text>
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
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.accent,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  periodButtonTextActive: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 20,
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
  modeCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  modeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  modeCount: {
    fontSize: 14,
    color: colors.grey,
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
  exportActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exportActionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  exportActionText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});

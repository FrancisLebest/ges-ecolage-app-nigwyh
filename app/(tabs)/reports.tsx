
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import StatCard from '../../components/StatCard';
import SimpleBottomSheet from '../../components/BottomSheet';
import { useSupabasePayments } from '../../hooks/useSupabasePayments';
import { useSupabaseStudents } from '../../hooks/useSupabaseStudents';

const ReportsScreen: React.FC = () => {
  const { 
    payments, 
    getPaymentsByPeriod, 
    getPaymentsByMode, 
    getStudentBalances 
  } = useSupabasePayments();
  const { exportStudentsToExcel } = useSupabaseStudents();
  
  const [showPeriodSheet, setShowPeriodSheet] = useState(false);
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('today');

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentsByCurrentPeriod = () => {
    const today = new Date();
    let startDate: string;
    let endDate = today.toISOString().split('T')[0];

    switch (selectedPeriod) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
        break;
      default:
        startDate = endDate;
    }

    return getPaymentsByPeriod(startDate, endDate);
  };

  const currentPeriodPayments = getPaymentsByCurrentPeriod();
  const paymentsByMode = getPaymentsByMode();
  const studentBalances = getStudentBalances();

  const getModeIcon = (mode: string): string => {
    switch (mode) {
      case 'especes': return 'dollar-sign';
      case 'cheque': return 'file-text';
      case 'virement': return 'credit-card';
      case 'mobile': return 'smartphone';
      default: return 'dollar-sign';
    }
  };

  const getModeLabel = (mode: string): string => {
    switch (mode) {
      case 'especes': return 'Espèces';
      case 'cheque': return 'Chèque';
      case 'virement': return 'Virement';
      case 'mobile': return 'Mobile Money';
      default: return mode;
    }
  };

  const getPeriodLabel = (): string => {
    switch (selectedPeriod) {
      case 'today': return 'Aujourd\'hui';
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      default: return 'Période sélectionnée';
    }
  };

  const handleExportBalances = async () => {
    try {
      const exportData = studentBalances.map(balance => ({
        'Matricule': balance.matricule,
        'Nom': balance.nom,
        'Prénom': balance.prenom,
        'Classe': balance.classe,
        'Total dû': balance.totalDu,
        'Total payé': balance.totalPaye,
        'Reste à payer': balance.resteAPayer,
        'Statut': balance.statut === 'solde' ? 'Soldé' : 'Non soldé'
      }));

      // In a real app, you would use a proper export library
      Alert.alert('Export', 'Fonctionnalité d\'export en cours de développement');
      console.log('Export data:', exportData);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'export');
    }
    setShowExportSheet(false);
  };

  const handleExportPayments = async () => {
    try {
      const exportData = currentPeriodPayments.map(payment => ({
        'Date': payment.datePaiement,
        'Matricule': payment.matricule,
        'Code frais': payment.codeFrais,
        'Montant': payment.montantPaye,
        'Mode': getModeLabel(payment.mode),
        'Numéro pièce': payment.numPiece || '',
        'Caissier': payment.caissier,
        'Commentaires': payment.commentaires || ''
      }));

      Alert.alert('Export', 'Fonctionnalité d\'export en cours de développement');
      console.log('Export payments:', exportData);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'export');
    }
    setShowExportSheet(false);
  };

  const totalAmount = currentPeriodPayments.reduce((sum, p) => sum + p.montantPaye, 0);
  const averagePayment = currentPeriodPayments.length > 0 ? totalAmount / currentPeriodPayments.length : 0;
  const soldeStudents = studentBalances.filter(b => b.statut === 'solde').length;
  const totalStudents = studentBalances.length;

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={commonStyles.title}>Rapports & Analyses</Text>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => setShowExportSheet(true)}
        >
          <Icon name="download" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.periodSelector}>
          <Text style={styles.sectionTitle}>Période d'analyse</Text>
          <TouchableOpacity 
            style={styles.periodButton}
            onPress={() => setShowPeriodSheet(true)}
          >
            <Text style={styles.periodButtonText}>{getPeriodLabel()}</Text>
            <Icon name="chevron-down" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total encaissé"
            value={formatCurrency(totalAmount)}
            icon="dollar-sign"
            color={colors.success}
            subtitle={getPeriodLabel()}
          />
          <StatCard
            title="Nb paiements"
            value={currentPeriodPayments.length.toString()}
            icon="credit-card"
            color={colors.primary}
            subtitle={getPeriodLabel()}
          />
          <StatCard
            title="Paiement moyen"
            value={formatCurrency(averagePayment)}
            icon="trending-up"
            color={colors.warning}
            subtitle={getPeriodLabel()}
          />
          <StatCard
            title="Élèves soldés"
            value={`${soldeStudents}/${totalStudents}`}
            icon="users"
            color={colors.info}
            subtitle={`${((soldeStudents/totalStudents)*100).toFixed(1)}%`}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Répartition par mode de paiement</Text>
          {paymentsByMode.map((modeData) => (
            <View key={modeData.mode} style={styles.modeItem}>
              <View style={styles.modeInfo}>
                <Icon 
                  name={getModeIcon(modeData.mode)} 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={styles.modeLabel}>
                  {getModeLabel(modeData.mode)}
                </Text>
              </View>
              <View style={styles.modeStats}>
                <Text style={styles.modeCount}>{modeData.count} paiements</Text>
                <Text style={styles.modeAmount}>
                  {formatCurrency(modeData.total)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse des soldes</Text>
          <View style={styles.balanceAnalysis}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Élèves soldés</Text>
              <Text style={[styles.balanceValue, { color: colors.success }]}>
                {soldeStudents}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Élèves non soldés</Text>
              <Text style={[styles.balanceValue, { color: colors.error }]}>
                {totalStudents - soldeStudents}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Taux de recouvrement</Text>
              <Text style={[styles.balanceValue, { color: colors.primary }]}>
                {totalStudents > 0 ? ((soldeStudents/totalStudents)*100).toFixed(1) : 0}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Totaux par classe</Text>
          {Array.from(new Set(studentBalances.map(b => b.classe))).map(classe => {
            const classeBalances = studentBalances.filter(b => b.classe === classe);
            const totalDu = classeBalances.reduce((sum, b) => sum + b.totalDu, 0);
            const totalPaye = classeBalances.reduce((sum, b) => sum + b.totalPaye, 0);
            const recouvrement = totalDu > 0 ? (totalPaye / totalDu) * 100 : 0;

            return (
              <View key={classe} style={styles.classItem}>
                <Text style={styles.className}>{classe}</Text>
                <View style={styles.classStats}>
                  <Text style={styles.classStat}>
                    Dû: {formatCurrency(totalDu)}
                  </Text>
                  <Text style={styles.classStat}>
                    Payé: {formatCurrency(totalPaye)}
                  </Text>
                  <Text style={[styles.classStat, { color: colors.primary }]}>
                    {recouvrement.toFixed(1)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <SimpleBottomSheet
        isVisible={showPeriodSheet}
        onClose={() => setShowPeriodSheet(false)}
      >
        <View style={styles.periodSheet}>
          <Text style={styles.sheetTitle}>Sélectionner une période</Text>
          
          {(['today', 'week', 'month'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodOption,
                selectedPeriod === period && styles.periodOptionSelected
              ]}
              onPress={() => {
                setSelectedPeriod(period);
                setShowPeriodSheet(false);
              }}
            >
              <Text style={[
                styles.periodOptionText,
                selectedPeriod === period && styles.periodOptionTextSelected
              ]}>
                {period === 'today' ? 'Aujourd\'hui' :
                 period === 'week' ? 'Cette semaine' :
                 'Ce mois'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SimpleBottomSheet>

      <SimpleBottomSheet
        isVisible={showExportSheet}
        onClose={() => setShowExportSheet(false)}
      >
        <View style={styles.exportSheet}>
          <Text style={styles.sheetTitle}>Options d'export</Text>
          
          <TouchableOpacity
            style={styles.exportOption}
            onPress={handleExportPayments}
          >
            <Icon name="credit-card" size={20} color={colors.primary} />
            <Text style={styles.exportOptionText}>
              Exporter les paiements ({getPeriodLabel()})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportOption}
            onPress={handleExportBalances}
          >
            <Icon name="users" size={20} color={colors.success} />
            <Text style={styles.exportOptionText}>
              Exporter les soldes élèves
            </Text>
          </TouchableOpacity>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  exportButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  periodSelector: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodButtonText: {
    fontSize: 16,
    color: colors.text,
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
  modeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  modeStats: {
    alignItems: 'flex-end',
  },
  modeCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  balanceAnalysis: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.text,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  classItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  classStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classStat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  periodSheet: {
    padding: 20,
  },
  exportSheet: {
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  periodOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  periodOptionSelected: {
    backgroundColor: colors.primary,
  },
  periodOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  periodOptionTextSelected: {
    color: colors.surface,
    fontWeight: '500',
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  exportOptionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
});

export default ReportsScreen;

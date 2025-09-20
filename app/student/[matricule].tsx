
import Icon from '../../components/Icon';
import { Student, Payment } from '../../types';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import AddPaymentModal from '../../components/AddPaymentModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSupabaseStudents } from '../../hooks/useSupabaseStudents';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useSupabasePayments } from '../../hooks/useSupabasePayments';
import PaymentCard from '../../components/PaymentCard';
import ActionButton from '../../components/ActionButton';
import { useSupabaseFees } from '../../hooks/useSupabaseFees';
import { printReceipt, ReceiptData } from '../../utils/pdfGenerator';

const StudentDetailScreen = () => {
  const { matricule } = useLocalSearchParams<{ matricule: string }>();
  const { students } = useSupabaseStudents();
  const { addPayment, getStudentPaymentHistory, getStudentBalances } = useSupabasePayments();
  const { fees } = useSupabaseFees();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  useEffect(() => {
    if (matricule && students.length > 0) {
      const foundStudent = students.find(s => s.matricule === matricule);
      setStudent(foundStudent || null);
      
      if (foundStudent) {
        const studentPayments = getStudentPaymentHistory(matricule);
        setPayments(studentPayments);
        
        const balances = getStudentBalances();
        const studentBalance = balances.find(b => b.matricule === matricule);
        setBalance(studentBalance);
      }
    }
  }, [matricule, students]);

  const handleAddPayment = async (payment: Payment) => {
    try {
      await addPayment(payment);
      setShowAddPaymentModal(false);
      
      // Refresh payments and balance
      const updatedPayments = getStudentPaymentHistory(matricule);
      setPayments(updatedPayments);
      
      const balances = getStudentBalances();
      const updatedBalance = balances.find(b => b.matricule === matricule);
      setBalance(updatedBalance);
      
      Alert.alert('Succès', 'Paiement enregistré avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'enregistrement du paiement');
    }
  };

  const handlePrintReceipt = async (payment: Payment) => {
    if (!student || !balance) {
      Alert.alert('Erreur', 'Données manquantes pour générer le reçu');
      return;
    }

    const fee = fees.find(f => f.code === payment.codeFrais);
    if (!fee) {
      Alert.alert('Erreur', 'Frais non trouvé');
      return;
    }

    const receiptData: ReceiptData = {
      student,
      payment,
      fee,
      balance
    };

    try {
      const result = await printReceipt(receiptData);
      if (result.success) {
        Alert.alert('Succès', result.message);
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la génération du reçu');
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (!student) {
    return (
      <SafeAreaView style={commonStyles.wrapper}>
        <View style={styles.container}>
          <Text style={styles.errorText}>Élève non trouvé</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Détails Élève</Text>
        <TouchableOpacity onPress={() => setShowAddPaymentModal(true)} style={styles.addButton}>
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Student Info Card */}
        <View style={styles.studentCard}>
          <View style={styles.studentHeader}>
            <View style={styles.avatarContainer}>
              <Icon name="person" size={32} color={colors.primary} />
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.nom} {student.prenom}</Text>
              <Text style={styles.studentMatricule}>{student.matricule}</Text>
              <Text style={styles.studentClass}>{student.classe}</Text>
            </View>
          </View>
          
          <View style={styles.studentDetails}>
            <View style={styles.detailRow}>
              <Icon name="calendar" size={16} color={colors.grey} />
              <Text style={styles.detailLabel}>Date de naissance:</Text>
              <Text style={styles.detailValue}>{formatDate(student.dateNaissance)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="call" size={16} color={colors.grey} />
              <Text style={styles.detailLabel}>Contact parent:</Text>
              <Text style={styles.detailValue}>{student.contactParent}</Text>
            </View>
            {student.emailParent && (
              <View style={styles.detailRow}>
                <Icon name="mail" size={16} color={colors.grey} />
                <Text style={styles.detailLabel}>Email parent:</Text>
                <Text style={styles.detailValue}>{student.emailParent}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Icon name="school" size={16} color={colors.grey} />
              <Text style={styles.detailLabel}>Date d'inscription:</Text>
              <Text style={styles.detailValue}>{formatDate(student.dateInscription)}</Text>
            </View>
          </View>
        </View>

        {/* Balance Card */}
        {balance && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Situation Financière</Text>
            <View style={styles.balanceGrid}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Total dû</Text>
                <Text style={styles.balanceAmount}>{formatCurrency(balance.totalDu)}</Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Total payé</Text>
                <Text style={[styles.balanceAmount, { color: colors.success }]}>
                  {formatCurrency(balance.totalPaye)}
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Reste à payer</Text>
                <Text style={[
                  styles.balanceAmount, 
                  { color: balance.resteAPayer <= 0 ? colors.success : colors.error }
                ]}>
                  {formatCurrency(balance.resteAPayer)}
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Statut</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: balance.statut === 'solde' ? colors.success : colors.error }
                ]}>
                  <Text style={styles.statusText}>
                    {balance.statut === 'solde' ? 'SOLDÉ' : 'NON SOLDÉ'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              title="Nouveau paiement"
              icon="card"
              onPress={() => setShowAddPaymentModal(true)}
              style={styles.actionButton}
            />
            <ActionButton
              title="Voir les frais"
              icon="receipt"
              variant="secondary"
              onPress={() => {
                // Navigate to fees with class filter
                Alert.alert('Info', 'Navigation vers les frais à implémenter');
              }}
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Payment History */}
        <View style={styles.paymentsSection}>
          <View style={styles.paymentsSectionHeader}>
            <Text style={styles.paymentsTitle}>Historique des paiements</Text>
            <Text style={styles.paymentsCount}>({payments.length})</Text>
          </View>
          
          {payments.length > 0 ? (
            payments.map((payment) => (
              <View key={payment.id} style={styles.paymentContainer}>
                <PaymentCard payment={payment} />
                <TouchableOpacity
                  onPress={() => handlePrintReceipt(payment)}
                  style={styles.receiptButton}
                >
                  <Icon name="print" size={20} color={colors.primary} />
                  <Text style={styles.receiptButtonText}>Reçu</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyPayments}>
              <Icon name="card-outline" size={48} color={colors.grey} />
              <Text style={styles.emptyPaymentsText}>Aucun paiement enregistré</Text>
              <Text style={styles.emptyPaymentsSubtext}>
                Commencez par enregistrer un paiement
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <AddPaymentModal
        visible={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onSave={handleAddPayment}
        prefilledMatricule={matricule}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '30',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  studentCard: {
    backgroundColor: colors.backgroundAlt,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  studentMatricule: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  studentClass: {
    fontSize: 14,
    color: colors.grey,
  },
  studentDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.grey + '30',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.grey,
    marginLeft: 8,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  balanceCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  balanceItem: {
    width: '48%',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  actionsCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  paymentsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  paymentsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  paymentsCount: {
    fontSize: 14,
    color: colors.grey,
    marginLeft: 8,
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    marginLeft: 8,
  },
  receiptButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyPayments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPaymentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyPaymentsSubtext: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
});

export default StudentDetailScreen;


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import PaymentCard from '../../components/PaymentCard';
import AddPaymentModal from '../../components/AddPaymentModal';
import { useSupabaseStudents } from '../../hooks/useSupabaseStudents';
import { useSupabasePayments } from '../../hooks/useSupabasePayments';
import { Student, Payment } from '../../types';

const StudentDetailScreen: React.FC = () => {
  const { matricule } = useLocalSearchParams<{ matricule: string }>();
  const { students } = useSupabaseStudents();
  const { 
    addPayment, 
    getStudentPaymentHistory, 
    getStudentBalances 
  } = useSupabasePayments();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  useEffect(() => {
    if (matricule) {
      const foundStudent = students.find(s => s.matricule === matricule);
      setStudent(foundStudent || null);
      
      const studentPayments = getStudentPaymentHistory(matricule);
      setPayments(studentPayments);
      
      const balances = getStudentBalances();
      const studentBalance = balances.find(b => b.matricule === matricule);
      setBalance(studentBalance || null);
    }
  }, [matricule, students]);

  const handleAddPayment = async (payment: Payment) => {
    try {
      await addPayment(payment);
      Alert.alert('Succès', 'Paiement enregistré avec succès');
      
      // Refresh payments
      const updatedPayments = getStudentPaymentHistory(matricule!);
      setPayments(updatedPayments);
      
      // Refresh balance
      const balances = getStudentBalances();
      const updatedBalance = balances.find(b => b.matricule === matricule);
      setBalance(updatedBalance || null);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'enregistrement du paiement');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (!student) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Élève introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Détail élève</Text>
        <TouchableOpacity 
          style={styles.addPaymentButton}
          onPress={() => setShowAddPaymentModal(true)}
        >
          <Icon name="plus" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.studentCard}>
          <View style={styles.studentHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {student.nom.charAt(0)}{student.prenom.charAt(0)}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {student.nom} {student.prenom}
              </Text>
              <Text style={styles.studentMatricule}>{student.matricule}</Text>
              <Text style={styles.studentClass}>{student.classe}</Text>
            </View>
          </View>

          <View style={styles.studentDetails}>
            <View style={styles.detailRow}>
              <Icon name="calendar" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                Né(e) le {formatDate(student.dateNaissance)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="phone" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{student.contactParent}</Text>
            </View>
            {student.emailParent && (
              <View style={styles.detailRow}>
                <Icon name="mail" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>{student.emailParent}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Icon name="user-check" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                Inscrit le {formatDate(student.dateInscription)}
              </Text>
            </View>
          </View>
        </View>

        {balance && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Situation financière</Text>
            <View style={styles.balanceGrid}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Total dû</Text>
                <Text style={styles.balanceValue}>
                  {formatCurrency(balance.totalDu)}
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Total payé</Text>
                <Text style={[styles.balanceValue, { color: colors.success }]}>
                  {formatCurrency(balance.totalPaye)}
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Reste à payer</Text>
                <Text style={[
                  styles.balanceValue, 
                  { color: balance.resteAPayer > 0 ? colors.error : colors.success }
                ]}>
                  {formatCurrency(balance.resteAPayer)}
                </Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: balance.statut === 'solde' ? colors.success : colors.error }
              ]} />
              <Text style={styles.statusText}>
                {balance.statut === 'solde' ? 'Soldé' : 'Non soldé'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.paymentsSection}>
          <Text style={styles.sectionTitle}>
            Historique des paiements ({payments.length})
          </Text>
          
          {payments.length > 0 ? (
            payments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))
          ) : (
            <View style={styles.emptyPayments}>
              <Icon name="credit-card" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyPaymentsText}>
                Aucun paiement enregistré
              </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  addPaymentButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  studentCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.surface,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  studentMatricule: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
  },
  studentClass: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  studentDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  balanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 20,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  paymentsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  emptyPayments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyPaymentsText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginTop: 16,
  },
  emptyPaymentsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default StudentDetailScreen;


import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Student } from '../types';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';

interface StudentCardProps {
  student: Student;
  onPress?: () => void;
  showBalance?: boolean;
  balance?: {
    totalDu: number;
    totalPaye: number;
    resteAPayer: number;
    statut: 'solde' | 'non_solde';
  };
}

const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  onPress, 
  showBalance = false, 
  balance 
}) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.studentInfo}>
          <Text style={styles.name}>
            {student.prenom} {student.nom}
          </Text>
          <Text style={styles.matricule}>
            {student.matricule}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.classe}>{student.classe}</Text>
          {showBalance && balance && (
            <View style={[
              styles.statusBadge,
              { backgroundColor: balance.statut === 'solde' ? '#4CAF50' : '#FF5722' }
            ]}>
              <Text style={styles.statusText}>
                {balance.statut === 'solde' ? 'Soldé' : 'Non soldé'}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Icon name="call" size={16} color={colors.grey} />
          <Text style={styles.detailText}>{student.contactParent}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={16} color={colors.grey} />
          <Text style={styles.detailText}>
            Né(e) le {new Date(student.dateNaissance).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>

      {showBalance && balance && (
        <View style={styles.balanceSection}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Total dû:</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balance.totalDu)}</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Payé:</Text>
            <Text style={[styles.balanceAmount, { color: '#4CAF50' }]}>
              {formatCurrency(balance.totalPaye)}
            </Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Reste:</Text>
            <Text style={[
              styles.balanceAmount, 
              { color: balance.resteAPayer > 0 ? '#FF5722' : '#4CAF50' }
            ]}>
              {formatCurrency(balance.resteAPayer)}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.grey + '20',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  matricule: {
    fontSize: 14,
    color: colors.grey,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  classe: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  details: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  balanceSection: {
    borderTopWidth: 1,
    borderTopColor: colors.grey + '30',
    paddingTop: 12,
    marginTop: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.grey,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});

export default StudentCard;

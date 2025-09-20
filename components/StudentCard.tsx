
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Icon from './Icon';
import { colors } from '../styles/commonStyles';
import { Student } from '../types';

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
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/student/${student.matricule}`);
    }
  };

  const getStatusColor = () => {
    if (!balance) return colors.textSecondary;
    return balance.statut === 'solde' ? colors.success : colors.error;
  };

  const getStatusText = () => {
    if (!balance) return student.statut;
    return balance.statut === 'solde' ? 'Soldé' : 'Non soldé';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {student.nom.charAt(0)}{student.prenom.charAt(0)}
          </Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.name}>
            {student.nom} {student.prenom}
          </Text>
          <Text style={styles.matricule}>{student.matricule}</Text>
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Icon name="users" size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>{student.classe}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="phone" size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>{student.contactParent}</Text>
            </View>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
          <Icon name="chevron-right" size={16} color={colors.textSecondary} />
        </View>
      </View>

      {showBalance && balance && (
        <View style={styles.balanceSection}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Total dû</Text>
            <Text style={styles.balanceValue}>
              {formatCurrency(balance.totalDu)}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Payé</Text>
            <Text style={[styles.balanceValue, { color: colors.success }]}>
              {formatCurrency(balance.totalPaye)}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Reste</Text>
            <Text style={[
              styles.balanceValue, 
              { color: balance.resteAPayer > 0 ? colors.error : colors.success }
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  studentInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  matricule: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});

export default StudentCard;

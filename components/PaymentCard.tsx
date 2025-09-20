
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Payment } from '../types';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';
import { mockFees } from '../data/mockData';

interface PaymentCardProps {
  payment: Payment;
  onPress?: () => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onPress }) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'especes':
        return 'cash';
      case 'cheque':
        return 'card';
      case 'virement':
        return 'swap-horizontal';
      case 'mobile':
        return 'phone-portrait';
      default:
        return 'wallet';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'especes':
        return '#4CAF50';
      case 'cheque':
        return '#2196F3';
      case 'virement':
        return '#FF9800';
      case 'mobile':
        return '#9C27B0';
      default:
        return colors.grey;
    }
  };

  const fee = mockFees.find(f => f.code === payment.codeFrais);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.paymentInfo}>
          <Text style={styles.amount}>{formatCurrency(payment.montantPaye)}</Text>
          <Text style={styles.date}>{formatDate(payment.datePaiement)}</Text>
        </View>
        <View style={[styles.modeIcon, { backgroundColor: getModeColor(payment.mode) }]}>
          <Icon name={getModeIcon(payment.mode)} size={20} color="white" />
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Icon name="person" size={16} color={colors.grey} />
          <Text style={styles.detailText}>Matricule: {payment.matricule}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="receipt" size={16} color={colors.grey} />
          <Text style={styles.detailText}>
            {fee ? fee.description : payment.codeFrais}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="person-circle" size={16} color={colors.grey} />
          <Text style={styles.detailText}>Caissier: {payment.caissier}</Text>
        </View>
        {payment.numPiece && (
          <View style={styles.detailRow}>
            <Icon name="document-text" size={16} color={colors.grey} />
            <Text style={styles.detailText}>N° pièce: {payment.numPiece}</Text>
          </View>
        )}
      </View>

      {payment.commentaires && (
        <View style={styles.commentSection}>
          <Text style={styles.comment}>{payment.commentaires}</Text>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.grey,
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
  },
  commentSection: {
    borderTopWidth: 1,
    borderTopColor: colors.grey + '30',
    paddingTop: 8,
    marginTop: 8,
  },
  comment: {
    fontSize: 14,
    color: colors.grey,
    fontStyle: 'italic',
  },
});

export default PaymentCard;

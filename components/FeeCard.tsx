
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from './Icon';
import { colors } from '../styles/commonStyles';
import { Fee } from '../hooks/useSupabaseFees';

interface FeeCardProps {
  fee: Fee;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const FeeCard: React.FC<FeeCardProps> = ({ fee, onPress, onEdit, onDelete }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.codeContainer}>
          <Text style={styles.code}>{fee.code}</Text>
          {fee.obligatoire && (
            <View style={styles.obligatoireBadge}>
              <Text style={styles.obligatoireText}>Obligatoire</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Icon name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Icon name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <Text style={styles.description}>{fee.description}</Text>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Icon name="dollar-sign" size={16} color={colors.success} />
          <Text style={styles.amount}>{formatCurrency(fee.montant)}</Text>
        </View>
        
        {fee.classe && (
          <View style={styles.detailItem}>
            <Icon name="users" size={16} color={colors.primary} />
            <Text style={styles.classe}>{fee.classe}</Text>
          </View>
        )}
        
        {fee.periodicite && (
          <View style={styles.detailItem}>
            <Icon name="calendar" size={16} color={colors.text} />
            <Text style={styles.periodicite}>{fee.periodicite}</Text>
          </View>
        )}
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  codeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  code: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  obligatoireBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  obligatoireText: {
    fontSize: 10,
    color: colors.surface,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 4,
  },
  classe: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  periodicite: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});

export default FeeCard;

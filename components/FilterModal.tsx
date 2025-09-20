
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch
} from 'react-native';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';
import { Picker } from '@react-native-picker/picker';

export interface FilterOptions {
  classe?: string;
  statut?: 'tous' | 'soldes' | 'non_soldes';
  mode?: string;
  dateDebut?: string;
  dateFin?: string;
  montantMin?: number;
  montantMax?: number;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  availableClasses: string[];
  availableModes?: string[];
  type: 'students' | 'payments' | 'fees';
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
  availableClasses,
  availableModes = [],
  type
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {};
    setFilters(resetFilters);
    onApply(resetFilters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Filtres</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Filtre par classe */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Classe</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.classe || ''}
                onValueChange={(value) => setFilters({ ...filters, classe: value || undefined })}
                style={styles.picker}
              >
                <Picker.Item label="Toutes les classes" value="" />
                {availableClasses.map((classe) => (
                  <Picker.Item key={classe} label={classe} value={classe} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Filtre par statut (pour les étudiants) */}
          {type === 'students' && (
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Statut de paiement</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.statut || 'tous'}
                  onValueChange={(value) => setFilters({ ...filters, statut: value as any })}
                  style={styles.picker}
                >
                  <Picker.Item label="Tous" value="tous" />
                  <Picker.Item label="Soldés" value="soldes" />
                  <Picker.Item label="Non soldés" value="non_soldes" />
                </Picker>
              </View>
            </View>
          )}

          {/* Filtre par mode de paiement */}
          {type === 'payments' && availableModes.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Mode de paiement</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.mode || ''}
                  onValueChange={(value) => setFilters({ ...filters, mode: value || undefined })}
                  style={styles.picker}
                >
                  <Picker.Item label="Tous les modes" value="" />
                  {availableModes.map((mode) => (
                    <Picker.Item key={mode} label={mode.toUpperCase()} value={mode} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {/* Filtres de montant */}
          {(type === 'payments' || type === 'fees') && (
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Montant</Text>
              <View style={styles.rangeContainer}>
                <View style={styles.rangeInput}>
                  <Text style={styles.rangeLabel}>Min (FCFA)</Text>
                  <Text style={styles.rangeValue}>
                    {filters.montantMin?.toLocaleString() || '0'}
                  </Text>
                </View>
                <View style={styles.rangeInput}>
                  <Text style={styles.rangeLabel}>Max (FCFA)</Text>
                  <Text style={styles.rangeValue}>
                    {filters.montantMax?.toLocaleString() || 'Illimité'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyText}>Appliquer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '30',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  resetButton: {
    padding: 8,
  },
  resetText: {
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  picker: {
    color: colors.text,
    backgroundColor: 'transparent',
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeInput: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: colors.backgroundAlt,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  rangeLabel: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 4,
  },
  rangeValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey + '30',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.text,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default FilterModal;

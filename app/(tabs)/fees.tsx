
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import SearchBar from '../../components/SearchBar';
import FeeCard from '../../components/FeeCard';
import AddFeeModal from '../../components/AddFeeModal';
import SimpleBottomSheet from '../../components/BottomSheet';
import { useSupabaseFees, Fee } from '../../hooks/useSupabaseFees';

const FeesScreen: React.FC = () => {
  const { fees, loading, addFee, updateFee, deleteFee, refreshFees } = useSupabaseFees();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFees, setFilteredFees] = useState<Fee[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'tous' | 'obligatoires' | 'optionnels'>('tous');
  const [editingFee, setEditingFee] = useState<Fee | undefined>(undefined);

  useEffect(() => {
    filterFees();
  }, [searchQuery, fees, selectedFilter]);

  const filterFees = () => {
    let filtered = fees;

    // Filter by search query
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(fee => 
        fee.code.toLowerCase().includes(lowercaseQuery) ||
        fee.description.toLowerCase().includes(lowercaseQuery) ||
        (fee.classe && fee.classe.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Filter by type
    if (selectedFilter === 'obligatoires') {
      filtered = filtered.filter(fee => fee.obligatoire);
    } else if (selectedFilter === 'optionnels') {
      filtered = filtered.filter(fee => !fee.obligatoire);
    }

    setFilteredFees(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFees();
    setRefreshing(false);
  };

  const handleAddFee = async (fee: Fee) => {
    try {
      await addFee(fee);
      Alert.alert('Succès', 'Frais ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'ajout du frais');
    }
  };

  const handleUpdateFee = async (fee: Fee) => {
    try {
      if (editingFee) {
        await updateFee(editingFee.code, fee);
        Alert.alert('Succès', 'Frais modifié avec succès');
        setEditingFee(undefined);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la modification du frais');
    }
  };

  const handleDeleteFee = (fee: Fee) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer le frais "${fee.description}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFee(fee.code);
              Alert.alert('Succès', 'Frais supprimé avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la suppression du frais');
            }
          }
        }
      ]
    );
  };

  const getFilterCount = (filter: 'tous' | 'obligatoires' | 'optionnels'): number => {
    switch (filter) {
      case 'obligatoires':
        return fees.filter(f => f.obligatoire).length;
      case 'optionnels':
        return fees.filter(f => !f.obligatoire).length;
      default:
        return fees.length;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalAmount = (): number => {
    return filteredFees.reduce((sum, fee) => sum + fee.montant, 0);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={commonStyles.title}>Gestion des Frais</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Icon name="plus" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher par code, description..."
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterSheet(true)}
        >
          <Icon name="filter" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{filteredFees.length}</Text>
          <Text style={styles.statLabel}>Frais</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCurrency(getTotalAmount())}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredFees.map((fee) => (
          <FeeCard
            key={fee.code}
            fee={fee}
            onEdit={() => {
              setEditingFee(fee);
              setShowAddModal(true);
            }}
            onDelete={() => handleDeleteFee(fee)}
          />
        ))}

        {filteredFees.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="dollar-sign" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Aucun frais trouvé' : 'Aucun frais enregistré'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Essayez une autre recherche' : 'Commencez par ajouter un frais'}
            </Text>
          </View>
        )}
      </ScrollView>

      <AddFeeModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingFee(undefined);
        }}
        onSave={editingFee ? handleUpdateFee : handleAddFee}
        fee={editingFee}
        isEditing={!!editingFee}
      />

      <SimpleBottomSheet
        isVisible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
      >
        <View style={styles.filterSheet}>
          <Text style={styles.filterTitle}>Filtrer par type</Text>
          
          {(['tous', 'obligatoires', 'optionnels'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterOption,
                selectedFilter === filter && styles.filterOptionSelected
              ]}
              onPress={() => {
                setSelectedFilter(filter);
                setShowFilterSheet(false);
              }}
            >
              <Text style={[
                styles.filterOptionText,
                selectedFilter === filter && styles.filterOptionTextSelected
              ]}>
                {filter === 'tous' ? 'Tous les frais' :
                 filter === 'obligatoires' ? 'Frais obligatoires' :
                 'Frais optionnels'}
              </Text>
              <Text style={styles.filterCount}>
                {getFilterCount(filter)}
              </Text>
            </TouchableOpacity>
          ))}
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
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  filterButton: {
    marginLeft: 12,
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  filterSheet: {
    padding: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  filterOptionTextSelected: {
    color: colors.surface,
    fontWeight: '500',
  },
  filterCount: {
    fontSize: 14,
    color: colors.textSecondary,
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
  },
});

export default FeesScreen;

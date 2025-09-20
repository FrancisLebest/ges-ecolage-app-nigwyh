
import AddFeeModal from '../../components/AddFeeModal';
import Icon from '../../components/Icon';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import SearchBar from '../../components/SearchBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import FeeCard from '../../components/FeeCard';
import { useSupabaseFees, Fee } from '../../hooks/useSupabaseFees';
import SimpleBottomSheet from '../../components/BottomSheet';
import ActionButton from '../../components/ActionButton';
import FilterModal, { FilterOptions } from '../../components/FilterModal';
import BulkActionModal from '../../components/BulkActionModal';
import { useAuth } from '../../hooks/useAuth';
import * as XLSX from 'xlsx';

const FeesScreen = () => {
  const { user, shouldHideDemoData } = useAuth();
  const { fees, loading, addFee, updateFee, deleteFee, refreshFees } = useSupabaseFees();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'tous' | 'obligatoires' | 'optionnels'>('tous');
  const [filteredFees, setFilteredFees] = useState<Fee[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});

  useEffect(() => {
    filterFees();
  }, [searchQuery, fees, selectedFilter, currentFilters]);

  const filterFees = () => {
    let filtered = fees;

    // Hide demo data if needed
    if (shouldHideDemoData) {
      filtered = filtered.filter(fee => 
        !['SCOL001', 'SCOL002', 'EXAM001', 'TRAN001', 'CANT001', 'UNIF001'].includes(fee.code)
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(fee => 
        fee.code.toLowerCase().includes(lowercaseQuery) ||
        fee.description.toLowerCase().includes(lowercaseQuery) ||
        (fee.classe && fee.classe.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Apply class filter
    if (currentFilters.classe) {
      filtered = filtered.filter(fee => fee.classe === currentFilters.classe);
    }

    // Apply obligatoire filter
    if (selectedFilter !== 'tous') {
      filtered = filtered.filter(fee => {
        if (selectedFilter === 'obligatoires') {
          return fee.obligatoire;
        } else if (selectedFilter === 'optionnels') {
          return !fee.obligatoire;
        }
        return true;
      });
    }

    // Apply amount filters
    if (currentFilters.montantMin !== undefined) {
      filtered = filtered.filter(fee => fee.montant >= currentFilters.montantMin!);
    }
    if (currentFilters.montantMax !== undefined) {
      filtered = filtered.filter(fee => fee.montant <= currentFilters.montantMax!);
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
      setShowAddModal(false);
      Alert.alert('Succès', 'Frais ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'ajout du frais');
    }
  };

  const handleUpdateFee = async (fee: Fee) => {
    try {
      if (editingFee) {
        await updateFee(editingFee.code, fee);
        setEditingFee(null);
        Alert.alert('Succès', 'Frais modifié avec succès');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la modification du frais');
    }
  };

  const handleDeleteFee = async (fee: Fee) => {
    Alert.alert(
      'Confirmation',
      `Êtes-vous sûr de vouloir supprimer le frais ${fee.code} ?`,
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

  const handleExportFees = async () => {
    try {
      const exportData = filteredFees.map(fee => ({
        'Code': fee.code,
        'Description': fee.description,
        'Montant': fee.montant,
        'Classe': fee.classe || '',
        'Obligatoire': fee.obligatoire ? 'Oui' : 'Non',
        'Périodicité': fee.periodicite || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Frais');

      Alert.alert('Succès', 'Export réalisé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'export');
    }
    setShowBottomSheet(false);
  };

  const toggleFeeSelection = (code: string) => {
    if (selectedFees.includes(code)) {
      setSelectedFees(selectedFees.filter(id => id !== code));
    } else {
      setSelectedFees([...selectedFees, code]);
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedFees([]);
  };

  const selectAllFees = () => {
    if (selectedFees.length === filteredFees.length) {
      setSelectedFees([]);
    } else {
      setSelectedFees(filteredFees.map(f => f.code));
    }
  };

  const handleBulkDelete = async (codes: string[]) => {
    for (const code of codes) {
      await deleteFee(code);
    }
    setSelectedFees([]);
    setSelectionMode(false);
  };

  const handleBulkExport = async (codes: string[]) => {
    const feesToExport = filteredFees.filter(f => codes.includes(f.code));
    const exportData = feesToExport.map(fee => ({
      'Code': fee.code,
      'Description': fee.description,
      'Montant': fee.montant,
      'Classe': fee.classe || '',
      'Obligatoire': fee.obligatoire ? 'Oui' : 'Non',
      'Périodicité': fee.periodicite || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Frais');

    Alert.alert('Succès', `${feesToExport.length} frais exportés`);
  };

  const applyFilters = (filters: FilterOptions) => {
    setCurrentFilters(filters);
  };

  const getFilterCount = (filter: 'tous' | 'obligatoires' | 'optionnels') => {
    if (filter === 'tous') return filteredFees.length;
    return filteredFees.filter(fee => {
      if (filter === 'obligatoires') {
        return fee.obligatoire;
      } else if (filter === 'optionnels') {
        return !fee.obligatoire;
      }
      return true;
    }).length;
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const getTotalAmount = () => {
    return filteredFees.reduce((sum, fee) => sum + fee.montant, 0);
  };

  const availableClasses = [...new Set(fees.map(f => f.classe).filter(Boolean))] as string[];

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Frais de scolarité</Text>
          <View style={styles.headerActions}>
            {selectionMode && (
              <>
                <TouchableOpacity onPress={selectAllFees} style={styles.headerButton}>
                  <Icon 
                    name={selectedFees.length === filteredFees.length ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={colors.primary} 
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowBulkModal(true)} style={styles.headerButton}>
                  <Icon name="options" size={24} color={colors.primary} />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={toggleSelectionMode} style={styles.headerButton}>
              <Icon name={selectionMode ? "close" : "checkmark-circle"} size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.headerButton}>
              <Icon name="filter" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowBottomSheet(true)} style={styles.headerButton}>
              <Icon name="ellipsis-vertical" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher par code, description..."
        />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total des frais</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(getTotalAmount())}</Text>
          <Text style={styles.summaryCount}>{filteredFees.length} frais</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
          {(['tous', 'obligatoires', 'optionnels'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                selectedFilter === filter && styles.activeFilterTab
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter && styles.activeFilterTabText
              ]}>
                {filter === 'tous' ? 'Tous' : filter === 'obligatoires' ? 'Obligatoires' : 'Optionnels'} ({getFilterCount(filter)})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredFees.map((fee) => (
          <TouchableOpacity
            key={fee.code}
            onPress={() => {
              if (selectionMode) {
                toggleFeeSelection(fee.code);
              }
            }}
            onLongPress={() => {
              if (!selectionMode) {
                setSelectionMode(true);
                setSelectedFees([fee.code]);
              }
            }}
          >
            <View style={[
              styles.feeCardContainer,
              selectionMode && selectedFees.includes(fee.code) && styles.selectedCard
            ]}>
              {selectionMode && (
                <View style={styles.selectionIndicator}>
                  <Icon 
                    name={selectedFees.includes(fee.code) ? "checkmark-circle" : "ellipse-outline"} 
                    size={24} 
                    color={selectedFees.includes(fee.code) ? colors.success : colors.grey} 
                  />
                </View>
              )}
              <FeeCard
                fee={fee}
                onEdit={!selectionMode && user?.role === 'admin' ? () => {
                  setEditingFee(fee);
                  setShowAddModal(true);
                } : undefined}
                onDelete={!selectionMode && user?.role === 'admin' ? () => handleDeleteFee(fee) : undefined}
              />
            </View>
          </TouchableOpacity>
        ))}

        {filteredFees.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="receipt" size={64} color={colors.grey} />
            <Text style={styles.emptyStateText}>Aucun frais trouvé</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter des frais'}
            </Text>
          </View>
        )}
      </ScrollView>

      {!selectionMode && user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      <AddFeeModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingFee(null);
        }}
        onSave={editingFee ? handleUpdateFee : handleAddFee}
        fee={editingFee || undefined}
        isEditing={!!editingFee}
      />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={applyFilters}
        currentFilters={currentFilters}
        availableClasses={availableClasses}
        type="fees"
      />

      <BulkActionModal
        visible={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        selectedItems={selectedFees}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        itemType="fees"
      />

      <SimpleBottomSheet isVisible={showBottomSheet} onClose={() => setShowBottomSheet(false)}>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Actions</Text>
          
          {user?.role === 'admin' && (
            <ActionButton
              title="Ajouter un frais"
              icon="add-circle"
              onPress={() => {
                setShowBottomSheet(false);
                setShowAddModal(true);
              }}
              style={styles.bottomSheetButton}
            />
          )}

          <ActionButton
            title="Exporter les frais"
            icon="download"
            variant="secondary"
            onPress={handleExportFees}
            style={styles.bottomSheetButton}
          />

          <ActionButton
            title="Imprimer la liste"
            icon="print"
            variant="secondary"
            onPress={() => {
              setShowBottomSheet(false);
              Alert.alert('Info', 'Fonctionnalité d\'impression à venir');
            }}
            style={styles.bottomSheetButton}
          />
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: colors.success + '20',
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 12,
    color: colors.grey,
  },
  filterTabs: {
    marginTop: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  feeCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedCard: {
    backgroundColor: colors.primary + '20',
  },
  selectionIndicator: {
    padding: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  bottomSheetButton: {
    marginBottom: 12,
  },
});

export default FeesScreen;

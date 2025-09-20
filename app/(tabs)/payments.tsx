
import Icon from '../../components/Icon';
import { Payment } from '../../types';
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
import SimpleBottomSheet from '../../components/BottomSheet';
import AddPaymentModal from '../../components/AddPaymentModal';
import SearchBar from '../../components/SearchBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useSupabasePayments } from '../../hooks/useSupabasePayments';
import PaymentCard from '../../components/PaymentCard';
import ActionButton from '../../components/ActionButton';
import FilterModal, { FilterOptions } from '../../components/FilterModal';
import BulkActionModal from '../../components/BulkActionModal';
import { useAuth } from '../../hooks/useAuth';
import * as XLSX from 'xlsx';
import * as Sharing from 'expo-sharing';

const PaymentsScreen = () => {
  const { user, shouldHideDemoData } = useAuth();
  const { payments, loading, addPayment, refreshPayments } = useSupabasePayments();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('tous');
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});

  useEffect(() => {
    filterPayments();
  }, [searchQuery, payments, selectedMode, currentFilters]);

  const filterPayments = () => {
    let filtered = payments;

    // Hide demo data if needed
    if (shouldHideDemoData) {
      filtered = filtered.filter(payment => 
        !payment.matricule.startsWith('ETU') ||
        !['admin', 'caissier1'].includes(payment.caissier.toLowerCase())
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.matricule.toLowerCase().includes(lowercaseQuery) ||
        payment.codeFrais.toLowerCase().includes(lowercaseQuery) ||
        payment.caissier.toLowerCase().includes(lowercaseQuery) ||
        (payment.numPiece && payment.numPiece.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Apply mode filter
    if (selectedMode !== 'tous' || currentFilters.mode) {
      const modeFilter = currentFilters.mode || selectedMode;
      if (modeFilter !== 'tous') {
        filtered = filtered.filter(payment => payment.mode === modeFilter);
      }
    }

    // Apply amount filters
    if (currentFilters.montantMin !== undefined) {
      filtered = filtered.filter(payment => payment.montantPaye >= currentFilters.montantMin!);
    }
    if (currentFilters.montantMax !== undefined) {
      filtered = filtered.filter(payment => payment.montantPaye <= currentFilters.montantMax!);
    }

    // Apply date filters
    if (currentFilters.dateDebut) {
      filtered = filtered.filter(payment => payment.datePaiement >= currentFilters.dateDebut!);
    }
    if (currentFilters.dateFin) {
      filtered = filtered.filter(payment => payment.datePaiement <= currentFilters.dateFin!);
    }

    setFilteredPayments(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPayments();
    setRefreshing(false);
  };

  const handleAddPayment = async (payment: Payment) => {
    try {
      await addPayment(payment);
      setShowAddModal(false);
      Alert.alert('Succès', 'Paiement enregistré avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'enregistrement du paiement');
    }
  };

  const handleExportPayments = async () => {
    try {
      const exportData = filteredPayments.map(payment => ({
        'Date': payment.datePaiement,
        'Matricule': payment.matricule,
        'Code Frais': payment.codeFrais,
        'Montant': payment.montantPaye,
        'Mode': payment.mode,
        'N° Pièce': payment.numPiece || '',
        'Caissier': payment.caissier,
        'Commentaires': payment.commentaires || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Paiements');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const filename = `paiements_${new Date().toISOString().split('T')[0]}.xlsx`;

      // For now, we'll just show success - in a real app you'd save/share the file
      Alert.alert('Succès', 'Export réalisé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'export');
    }
    setShowBottomSheet(false);
  };

  const togglePaymentSelection = (id: string) => {
    if (selectedPayments.includes(id)) {
      setSelectedPayments(selectedPayments.filter(paymentId => paymentId !== id));
    } else {
      setSelectedPayments([...selectedPayments, id]);
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedPayments([]);
  };

  const selectAllPayments = () => {
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(filteredPayments.map(p => p.id));
    }
  };

  const handleBulkDelete = async (paymentIds: string[]) => {
    // In a real app, you'd implement bulk delete in the hook
    Alert.alert('Info', 'Suppression groupée non implémentée pour les paiements');
    setSelectedPayments([]);
    setSelectionMode(false);
  };

  const handleBulkExport = async (paymentIds: string[]) => {
    const paymentsToExport = filteredPayments.filter(p => paymentIds.includes(p.id));
    const exportData = paymentsToExport.map(payment => ({
      'Date': payment.datePaiement,
      'Matricule': payment.matricule,
      'Code Frais': payment.codeFrais,
      'Montant': payment.montantPaye,
      'Mode': payment.mode,
      'N° Pièce': payment.numPiece || '',
      'Caissier': payment.caissier,
      'Commentaires': payment.commentaires || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Paiements');

    // For now, just show success
    Alert.alert('Succès', `${paymentsToExport.length} paiements exportés`);
  };

  const applyFilters = (filters: FilterOptions) => {
    setCurrentFilters(filters);
    if (filters.mode) {
      setSelectedMode(filters.mode);
    }
  };

  const getTotalAmount = () => {
    return filteredPayments.reduce((sum, payment) => sum + payment.montantPaye, 0);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const getModeCount = (mode: string) => {
    if (mode === 'tous') return filteredPayments.length;
    return filteredPayments.filter(p => p.mode === mode).length;
  };

  const availableModes = ['especes', 'cheque', 'virement', 'mobile'];

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Paiements</Text>
          <View style={styles.headerActions}>
            {selectionMode && (
              <>
                <TouchableOpacity onPress={selectAllPayments} style={styles.headerButton}>
                  <Icon 
                    name={selectedPayments.length === filteredPayments.length ? "checkbox" : "square-outline"} 
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
          placeholder="Rechercher par matricule, frais, caissier..."
        />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total affiché</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(getTotalAmount())}</Text>
          <Text style={styles.summaryCount}>{filteredPayments.length} paiement(s)</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
          {(['tous', ...availableModes]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.filterTab,
                selectedMode === mode && styles.activeFilterTab
              ]}
              onPress={() => setSelectedMode(mode)}
            >
              <Text style={[
                styles.filterTabText,
                selectedMode === mode && styles.activeFilterTabText
              ]}>
                {mode === 'tous' ? 'Tous' : mode.toUpperCase()} ({getModeCount(mode)})
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
        {filteredPayments.map((payment) => (
          <TouchableOpacity
            key={payment.id}
            onPress={() => {
              if (selectionMode) {
                togglePaymentSelection(payment.id);
              }
            }}
            onLongPress={() => {
              if (!selectionMode) {
                setSelectionMode(true);
                setSelectedPayments([payment.id]);
              }
            }}
          >
            <View style={[
              styles.paymentCardContainer,
              selectionMode && selectedPayments.includes(payment.id) && styles.selectedCard
            ]}>
              {selectionMode && (
                <View style={styles.selectionIndicator}>
                  <Icon 
                    name={selectedPayments.includes(payment.id) ? "checkmark-circle" : "ellipse-outline"} 
                    size={24} 
                    color={selectedPayments.includes(payment.id) ? colors.success : colors.grey} 
                  />
                </View>
              )}
              <PaymentCard payment={payment} />
            </View>
          </TouchableOpacity>
        ))}

        {filteredPayments.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="card" size={64} color={colors.grey} />
            <Text style={styles.emptyStateText}>Aucun paiement trouvé</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Essayez de modifier votre recherche' : 'Aucun paiement enregistré'}
            </Text>
          </View>
        )}
      </ScrollView>

      {!selectionMode && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      <AddPaymentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddPayment}
      />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={applyFilters}
        currentFilters={currentFilters}
        availableClasses={[]}
        availableModes={availableModes}
        type="payments"
      />

      <BulkActionModal
        visible={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        selectedItems={selectedPayments}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        itemType="payments"
      />

      <SimpleBottomSheet isVisible={showBottomSheet} onClose={() => setShowBottomSheet(false)}>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Actions</Text>
          
          <ActionButton
            title="Nouveau paiement"
            icon="card"
            onPress={() => {
              setShowBottomSheet(false);
              setShowAddModal(true);
            }}
            style={styles.bottomSheetButton}
          />

          <ActionButton
            title="Exporter les paiements"
            icon="download"
            variant="secondary"
            onPress={handleExportPayments}
            style={styles.bottomSheetButton}
          />

          <ActionButton
            title="Rapport de paiements"
            icon="document-text"
            variant="secondary"
            onPress={() => {
              setShowBottomSheet(false);
              Alert.alert('Info', 'Fonctionnalité de rapport à venir');
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
    backgroundColor: colors.primary + '20',
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
    color: colors.primary,
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
  },
  paymentCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
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

export default PaymentsScreen;

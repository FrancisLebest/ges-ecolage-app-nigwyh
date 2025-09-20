
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../../styles/commonStyles';
import { usePayments } from '../../hooks/usePayments';
import PaymentCard from '../../components/PaymentCard';
import SearchBar from '../../components/SearchBar';
import Icon from '../../components/Icon';
import SimpleBottomSheet from '../../components/BottomSheet';

export default function PaymentsScreen() {
  const { payments, loading } = usePayments();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPayments, setFilteredPayments] = useState(payments);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('tous');

  useEffect(() => {
    let filtered = payments.filter(payment => 
      payment.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.caissier.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedMode !== 'tous') {
      filtered = filtered.filter(payment => payment.mode === selectedMode);
    }

    // Trier par date décroissante
    filtered.sort((a, b) => new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime());
    
    setFilteredPayments(filtered);
  }, [searchQuery, payments, selectedMode]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getTotalAmount = () => {
    return filteredPayments.reduce((sum, payment) => sum + payment.montantPaye, 0);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const paymentModes = [
    { key: 'tous', label: 'Tous les modes', icon: 'wallet' },
    { key: 'especes', label: 'Espèces', icon: 'cash' },
    { key: 'cheque', label: 'Chèque', icon: 'card' },
    { key: 'virement', label: 'Virement', icon: 'swap-horizontal' },
    { key: 'mobile', label: 'Mobile Money', icon: 'phone-portrait' },
  ];

  const getModeCount = (mode: string) => {
    if (mode === 'tous') return payments.length;
    return payments.filter(p => p.mode === mode).length;
  };

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Paiements</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Icon name="filter" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton}>
              <Icon name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total affiché</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(getTotalAmount())}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Transactions</Text>
            <Text style={styles.summaryValue}>
              {filteredPayments.length}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher par matricule, ID ou caissier..."
          onClear={() => setSearchQuery('')}
        />

        {/* Filter Indicator */}
        {selectedMode !== 'tous' && (
          <View style={styles.filterIndicator}>
            <Text style={styles.filterText}>
              Mode: {paymentModes.find(m => m.key === selectedMode)?.label}
            </Text>
            <TouchableOpacity onPress={() => setSelectedMode('tous')}>
              <Icon name="close" size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>
        )}

        {/* Payments List */}
        <ScrollView
          style={styles.paymentsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredPayments.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="card" size={64} color={colors.grey} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Aucun paiement trouvé' : 'Aucun paiement enregistré'}
              </Text>
            </View>
          ) : (
            filteredPayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onPress={() => console.log('Payment pressed:', payment.id)}
              />
            ))
          )}
        </ScrollView>

        {/* Filter Bottom Sheet */}
        <SimpleBottomSheet
          isVisible={showFilters}
          onClose={() => setShowFilters(false)}
        >
          <View style={styles.filterSheet}>
            <Text style={styles.filterSheetTitle}>Filtrer par mode de paiement</Text>
            
            {paymentModes.map((mode) => (
              <TouchableOpacity
                key={mode.key}
                style={[
                  styles.filterOption,
                  selectedMode === mode.key && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedMode(mode.key);
                  setShowFilters(false);
                }}
              >
                <Icon name={mode.icon} size={20} color={colors.text} />
                <Text style={styles.filterOptionText}>
                  {mode.label} ({getModeCount(mode.key)})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SimpleBottomSheet>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summary: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  filterIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.accent + '20',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  paymentsList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.grey,
    marginTop: 16,
    textAlign: 'center',
  },
  filterSheet: {
    padding: 20,
  },
  filterSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: colors.accent + '20',
  },
  filterOptionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
});

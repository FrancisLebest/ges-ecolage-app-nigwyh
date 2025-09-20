
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
import { useStudents } from '../../hooks/useStudents';
import { usePayments } from '../../hooks/usePayments';
import StudentCard from '../../components/StudentCard';
import SearchBar from '../../components/SearchBar';
import Icon from '../../components/Icon';
import SimpleBottomSheet from '../../components/BottomSheet';

export default function StudentsScreen() {
  const { students, loading, searchStudents } = useStudents();
  const { getStudentBalances } = usePayments();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'tous' | 'soldes' | 'non_soldes'>('tous');

  const balances = getStudentBalances();

  useEffect(() => {
    let filtered = searchStudents(searchQuery);
    
    if (selectedFilter !== 'tous') {
      const balanceMap = new Map(balances.map(b => [b.matricule, b]));
      filtered = filtered.filter(student => {
        const balance = balanceMap.get(student.matricule);
        if (!balance) return false;
        return selectedFilter === 'soldes' ? balance.statut === 'solde' : balance.statut === 'non_solde';
      });
    }
    
    setFilteredStudents(filtered);
  }, [searchQuery, students, selectedFilter, balances]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStudentBalance = (matricule: string) => {
    return balances.find(b => b.matricule === matricule);
  };

  const getFilterCount = (filter: 'tous' | 'soldes' | 'non_soldes') => {
    switch (filter) {
      case 'tous':
        return students.length;
      case 'soldes':
        return balances.filter(b => b.statut === 'solde').length;
      case 'non_soldes':
        return balances.filter(b => b.statut === 'non_solde').length;
      default:
        return 0;
    }
  };

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gestion des Élèves</Text>
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

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher par matricule, nom ou téléphone..."
          onClear={() => setSearchQuery('')}
        />

        {/* Filter Indicator */}
        {selectedFilter !== 'tous' && (
          <View style={styles.filterIndicator}>
            <Text style={styles.filterText}>
              Filtre: {selectedFilter === 'soldes' ? 'Élèves soldés' : 'Élèves non soldés'}
            </Text>
            <TouchableOpacity onPress={() => setSelectedFilter('tous')}>
              <Icon name="close" size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>
        )}

        {/* Students List */}
        <ScrollView
          style={styles.studentsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredStudents.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="people" size={64} color={colors.grey} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Aucun élève trouvé' : 'Aucun élève enregistré'}
              </Text>
            </View>
          ) : (
            filteredStudents.map((student) => (
              <StudentCard
                key={student.matricule}
                student={student}
                showBalance={true}
                balance={getStudentBalance(student.matricule)}
                onPress={() => console.log('Student pressed:', student.matricule)}
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
            <Text style={styles.filterSheetTitle}>Filtrer les élèves</Text>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedFilter === 'tous' && styles.filterOptionActive
              ]}
              onPress={() => {
                setSelectedFilter('tous');
                setShowFilters(false);
              }}
            >
              <Icon name="people" size={20} color={colors.text} />
              <Text style={styles.filterOptionText}>
                Tous les élèves ({getFilterCount('tous')})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedFilter === 'soldes' && styles.filterOptionActive
              ]}
              onPress={() => {
                setSelectedFilter('soldes');
                setShowFilters(false);
              }}
            >
              <Icon name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.filterOptionText}>
                Élèves soldés ({getFilterCount('soldes')})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedFilter === 'non_soldes' && styles.filterOptionActive
              ]}
              onPress={() => {
                setSelectedFilter('non_soldes');
                setShowFilters(false);
              }}
            >
              <Icon name="alert-circle" size={20} color="#FF5722" />
              <Text style={styles.filterOptionText}>
                Élèves non soldés ({getFilterCount('non_soldes')})
              </Text>
            </TouchableOpacity>
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
  studentsList: {
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


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
import StudentCard from '../../components/StudentCard';
import AddStudentModal from '../../components/AddStudentModal';
import SimpleBottomSheet from '../../components/BottomSheet';
import { useSupabaseStudents } from '../../hooks/useSupabaseStudents';
import { useSupabasePayments } from '../../hooks/useSupabasePayments';
import { Student } from '../../types';

const StudentsScreen: React.FC = () => {
  const { 
    students, 
    loading, 
    addStudent, 
    updateStudent, 
    deleteStudent, 
    searchStudents, 
    refreshStudents,
    importStudentsFromFile,
    exportStudentsToExcel
  } = useSupabaseStudents();
  
  const { getStudentBalances } = useSupabasePayments();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'tous' | 'soldes' | 'non_soldes'>('tous');
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  const [balances, setBalances] = useState<any[]>([]);

  useEffect(() => {
    const studentBalances = getStudentBalances();
    setBalances(studentBalances);
  }, [students]);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students, selectedFilter, balances]);

  const filterStudents = () => {
    let filtered = searchStudents(searchQuery);

    // Filter by payment status
    if (selectedFilter === 'soldes') {
      const soldeMatricules = balances
        .filter(b => b.statut === 'solde')
        .map(b => b.matricule);
      filtered = filtered.filter(s => soldeMatricules.includes(s.matricule));
    } else if (selectedFilter === 'non_soldes') {
      const nonSoldeMatricules = balances
        .filter(b => b.statut === 'non_solde')
        .map(b => b.matricule);
      filtered = filtered.filter(s => nonSoldeMatricules.includes(s.matricule));
    }

    setFilteredStudents(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshStudents();
    setRefreshing(false);
  };

  const handleAddStudent = async (student: Student) => {
    try {
      await addStudent(student);
      Alert.alert('Succès', 'Élève ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'ajout de l\'élève');
    }
  };

  const handleUpdateStudent = async (student: Student) => {
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.matricule, student);
        Alert.alert('Succès', 'Élève modifié avec succès');
        setEditingStudent(undefined);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la modification de l\'élève');
    }
  };

  const handleDeleteStudent = (student: Student) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer l'élève ${student.nom} ${student.prenom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStudent(student.matricule);
              Alert.alert('Succès', 'Élève supprimé avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la suppression de l\'élève');
            }
          }
        }
      ]
    );
  };

  const handleImportStudents = async () => {
    try {
      const result = await importStudentsFromFile();
      if (result.success) {
        Alert.alert('Succès', result.message);
        if (result.errors && result.errors.length > 0) {
          Alert.alert('Avertissements', result.errors.join('\n'));
        }
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'import: ' + error);
    }
    setShowActionsSheet(false);
  };

  const handleExportStudents = async () => {
    try {
      const result = await exportStudentsToExcel(filteredStudents);
      if (result.success) {
        Alert.alert('Succès', 'Export réalisé avec succès');
        // Note: In a real app, you would save the file or share it
        console.log('Export data:', result.data);
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'export: ' + error);
    }
    setShowActionsSheet(false);
  };

  const getStudentBalance = (matricule: string) => {
    return balances.find(b => b.matricule === matricule);
  };

  const getFilterCount = (filter: 'tous' | 'soldes' | 'non_soldes'): number => {
    switch (filter) {
      case 'soldes':
        return balances.filter(b => b.statut === 'solde').length;
      case 'non_soldes':
        return balances.filter(b => b.statut === 'non_solde').length;
      default:
        return students.length;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={commonStyles.title}>Gestion des Élèves</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowActionsSheet(true)}
          >
            <Icon name="more-horizontal" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Icon name="plus" size={24} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher par matricule, nom..."
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
          <Text style={styles.statValue}>{filteredStudents.length}</Text>
          <Text style={styles.statLabel}>Élèves</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getFilterCount('soldes')}</Text>
          <Text style={styles.statLabel}>Soldés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getFilterCount('non_soldes')}</Text>
          <Text style={styles.statLabel}>Non soldés</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredStudents.map((student) => (
          <StudentCard
            key={student.matricule}
            student={student}
            showBalance={true}
            balance={getStudentBalance(student.matricule)}
            onPress={() => {
              setEditingStudent(student);
              setShowAddModal(true);
            }}
          />
        ))}

        {filteredStudents.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="users" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Aucun élève trouvé' : 'Aucun élève enregistré'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Essayez une autre recherche' : 'Commencez par ajouter un élève'}
            </Text>
          </View>
        )}
      </ScrollView>

      <AddStudentModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingStudent(undefined);
        }}
        onSave={editingStudent ? handleUpdateStudent : handleAddStudent}
        student={editingStudent}
        isEditing={!!editingStudent}
      />

      <SimpleBottomSheet
        isVisible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
      >
        <View style={styles.filterSheet}>
          <Text style={styles.filterTitle}>Filtrer par statut</Text>
          
          {(['tous', 'soldes', 'non_soldes'] as const).map((filter) => (
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
                {filter === 'tous' ? 'Tous les élèves' :
                 filter === 'soldes' ? 'Élèves soldés' :
                 'Élèves non soldés'}
              </Text>
              <Text style={styles.filterCount}>
                {getFilterCount(filter)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SimpleBottomSheet>

      <SimpleBottomSheet
        isVisible={showActionsSheet}
        onClose={() => setShowActionsSheet(false)}
      >
        <View style={styles.actionsSheet}>
          <Text style={styles.actionsTitle}>Actions</Text>
          
          <TouchableOpacity
            style={styles.actionOption}
            onPress={handleImportStudents}
          >
            <Icon name="upload" size={20} color={colors.primary} />
            <Text style={styles.actionOptionText}>Importer depuis Excel/CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionOption}
            onPress={handleExportStudents}
          >
            <Icon name="download" size={20} color={colors.success} />
            <Text style={styles.actionOptionText}>Exporter vers Excel</Text>
          </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 12,
    padding: 8,
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
  actionsSheet: {
    padding: 20,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionOptionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
});

export default StudentsScreen;

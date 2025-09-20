
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
import StudentCard from '../../components/StudentCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSupabaseStudents } from '../../hooks/useSupabaseStudents';
import React, { useState, useEffect } from 'react';
import AddStudentModal from '../../components/AddStudentModal';
import { useSupabasePayments } from '../../hooks/useSupabasePayments';
import { Student } from '../../types';
import SimpleBottomSheet from '../../components/BottomSheet';
import ActionButton from '../../components/ActionButton';
import FilterModal, { FilterOptions } from '../../components/FilterModal';
import BulkActionModal from '../../components/BulkActionModal';
import { useAuth } from '../../hooks/useAuth';
import { printStudentList } from '../../utils/pdfGenerator';

const StudentsScreen = () => {
  const { user, shouldHideDemoData } = useAuth();
  const { students, loading, addStudent, updateStudent, deleteStudent, refreshStudents, importStudentsFromFile, exportStudentsToExcel } = useSupabaseStudents();
  const { getStudentBalances } = useSupabasePayments();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'tous' | 'soldes' | 'non_soldes'>('tous');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students, selectedFilter, balances, currentFilters]);

  useEffect(() => {
    if (students.length > 0) {
      const studentBalances = getStudentBalances();
      setBalances(studentBalances);
    }
  }, [students]);

  const filterStudents = () => {
    let filtered = students;

    // Hide demo data if needed
    if (shouldHideDemoData) {
      filtered = filtered.filter(student => 
        !student.matricule.startsWith('ETU') || 
        !['KOUAME', 'TRAORE', 'KONE', 'OUATTARA'].includes(student.nom)
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.matricule.toLowerCase().includes(lowercaseQuery) ||
        student.nom.toLowerCase().includes(lowercaseQuery) ||
        student.prenom.toLowerCase().includes(lowercaseQuery) ||
        student.contactParent.includes(searchQuery) ||
        student.classe.toLowerCase().includes(lowercaseQuery)
      );
    }

    // Apply class filter
    if (currentFilters.classe) {
      filtered = filtered.filter(student => student.classe === currentFilters.classe);
    }

    // Apply balance filter
    if (selectedFilter !== 'tous' || currentFilters.statut) {
      const statusFilter = currentFilters.statut || selectedFilter;
      filtered = filtered.filter(student => {
        const balance = balances.find(b => b.matricule === student.matricule);
        if (!balance) return statusFilter === 'non_soldes';
        
        if (statusFilter === 'soldes') {
          return balance.statut === 'solde';
        } else if (statusFilter === 'non_soldes') {
          return balance.statut === 'non_solde';
        }
        return true;
      });
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
      setShowAddModal(false);
      Alert.alert('Succès', 'Élève ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'ajout de l\'élève');
    }
  };

  const handleUpdateStudent = async (student: Student) => {
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.matricule, student);
        setEditingStudent(null);
        Alert.alert('Succès', 'Élève modifié avec succès');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la modification de l\'élève');
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    Alert.alert(
      'Confirmation',
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
      Alert.alert('Erreur', 'Erreur lors de l\'import');
    }
    setShowBottomSheet(false);
  };

  const handleExportStudents = async () => {
    try {
      const result = await exportStudentsToExcel(filteredStudents);
      if (result.success) {
        Alert.alert('Succès', 'Export réalisé avec succès');
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'export');
    }
    setShowBottomSheet(false);
  };

  const handlePrintStudents = async () => {
    try {
      const result = await printStudentList(filteredStudents, balances);
      if (result.success) {
        Alert.alert('Succès', result.message);
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'impression');
    }
    setShowBottomSheet(false);
  };

  const toggleStudentSelection = (matricule: string) => {
    if (selectedStudents.includes(matricule)) {
      setSelectedStudents(selectedStudents.filter(id => id !== matricule));
    } else {
      setSelectedStudents([...selectedStudents, matricule]);
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedStudents([]);
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.matricule));
    }
  };

  const handleBulkDelete = async (matricules: string[]) => {
    for (const matricule of matricules) {
      await deleteStudent(matricule);
    }
    setSelectedStudents([]);
    setSelectionMode(false);
  };

  const handleBulkExport = async (matricules: string[]) => {
    const studentsToExport = filteredStudents.filter(s => matricules.includes(s.matricule));
    const result = await exportStudentsToExcel(studentsToExport);
    if (!result.success) {
      throw new Error(result.message);
    }
  };

  const handleBulkPrint = async (matricules: string[]) => {
    const studentsToExport = filteredStudents.filter(s => matricules.includes(s.matricule));
    const balancesToExport = balances.filter(b => matricules.includes(b.matricule));
    const result = await printStudentList(studentsToExport, balancesToExport);
    if (!result.success) {
      throw new Error(result.message);
    }
  };

  const applyFilters = (filters: FilterOptions) => {
    setCurrentFilters(filters);
    if (filters.statut) {
      setSelectedFilter(filters.statut);
    }
  };

  const getStudentBalance = (matricule: string) => {
    return balances.find(b => b.matricule === matricule);
  };

  const getFilterCount = (filter: 'tous' | 'soldes' | 'non_soldes') => {
    if (filter === 'tous') return filteredStudents.length;
    return filteredStudents.filter(student => {
      const balance = getStudentBalance(student.matricule);
      if (!balance) return filter === 'non_soldes';
      return filter === 'soldes' ? balance.statut === 'solde' : balance.statut === 'non_solde';
    }).length;
  };

  const availableClasses = [...new Set(students.map(s => s.classe))];

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Élèves</Text>
          <View style={styles.headerActions}>
            {selectionMode && (
              <>
                <TouchableOpacity onPress={selectAllStudents} style={styles.headerButton}>
                  <Icon 
                    name={selectedStudents.length === filteredStudents.length ? "checkbox" : "square-outline"} 
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
          placeholder="Rechercher par matricule, nom, classe..."
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
          {(['tous', 'soldes', 'non_soldes'] as const).map((filter) => (
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
                {filter === 'tous' ? 'Tous' : filter === 'soldes' ? 'Soldés' : 'Non soldés'} ({getFilterCount(filter)})
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
        {filteredStudents.map((student) => (
          <TouchableOpacity
            key={student.matricule}
            onPress={() => {
              if (selectionMode) {
                toggleStudentSelection(student.matricule);
              }
            }}
            onLongPress={() => {
              if (!selectionMode) {
                setSelectionMode(true);
                setSelectedStudents([student.matricule]);
              }
            }}
          >
            <View style={[
              styles.studentCardContainer,
              selectionMode && selectedStudents.includes(student.matricule) && styles.selectedCard
            ]}>
              {selectionMode && (
                <View style={styles.selectionIndicator}>
                  <Icon 
                    name={selectedStudents.includes(student.matricule) ? "checkmark-circle" : "ellipse-outline"} 
                    size={24} 
                    color={selectedStudents.includes(student.matricule) ? colors.success : colors.grey} 
                  />
                </View>
              )}
              <StudentCard
                student={student}
                showBalance={true}
                balance={getStudentBalance(student.matricule)}
              />
              {!selectionMode && user?.role === 'admin' && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingStudent(student);
                      setShowAddModal(true);
                    }}
                    style={styles.actionButton}
                  >
                    <Icon name="create" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteStudent(student)}
                    style={styles.actionButton}
                  >
                    <Icon name="trash" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {filteredStudents.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="school" size={64} color={colors.grey} />
            <Text style={styles.emptyStateText}>Aucun élève trouvé</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter des élèves'}
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

      <AddStudentModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingStudent(null);
        }}
        onSave={editingStudent ? handleUpdateStudent : handleAddStudent}
        student={editingStudent || undefined}
        isEditing={!!editingStudent}
      />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={applyFilters}
        currentFilters={currentFilters}
        availableClasses={availableClasses}
        type="students"
      />

      <BulkActionModal
        visible={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        selectedItems={selectedStudents}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        onBulkPrint={handleBulkPrint}
        itemType="students"
      />

      <SimpleBottomSheet isVisible={showBottomSheet} onClose={() => setShowBottomSheet(false)}>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Actions</Text>
          
          <ActionButton
            title="Ajouter un élève"
            icon="person-add"
            onPress={() => {
              setShowBottomSheet(false);
              setShowAddModal(true);
            }}
            style={styles.bottomSheetButton}
          />

          <ActionButton
            title="Importer des élèves"
            icon="cloud-upload"
            variant="secondary"
            onPress={handleImportStudents}
            style={styles.bottomSheetButton}
          />

          <ActionButton
            title="Exporter la liste"
            icon="download"
            variant="secondary"
            onPress={handleExportStudents}
            style={styles.bottomSheetButton}
          />

          <ActionButton
            title="Imprimer la liste"
            icon="print"
            variant="secondary"
            onPress={handlePrintStudents}
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
  studentCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
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

export default StudentsScreen;

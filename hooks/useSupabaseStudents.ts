
import { useState, useEffect } from 'react';
import { supabase } from '../app/integrations/supabase/client';
import { Student } from '../types';
import * as XLSX from 'xlsx';
import * as DocumentPicker from 'expo-document-picker';

export const useSupabaseStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('nom', { ascending: true });

      if (error) {
        console.log('Error loading students:', error);
        return;
      }

      const formattedStudents: Student[] = data.map(student => ({
        matricule: student.matricule,
        nom: student.nom,
        prenom: student.prenom,
        sexe: student.sexe,
        dateNaissance: student.date_naissance,
        classe: student.classe,
        contactParent: student.contact_parent,
        emailParent: student.email_parent,
        dateInscription: student.date_inscription,
        statut: student.statut
      }));

      setStudents(formattedStudents);
    } catch (error) {
      console.log('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (student: Student) => {
    try {
      const { error } = await supabase
        .from('students')
        .insert({
          matricule: student.matricule,
          nom: student.nom,
          prenom: student.prenom,
          sexe: student.sexe,
          date_naissance: student.dateNaissance,
          classe: student.classe,
          contact_parent: student.contactParent,
          email_parent: student.emailParent,
          date_inscription: student.dateInscription,
          statut: student.statut
        });

      if (error) {
        console.log('Error adding student:', error);
        throw error;
      }

      await loadStudents();
    } catch (error) {
      console.log('Error adding student:', error);
      throw error;
    }
  };

  const updateStudent = async (matricule: string, updatedStudent: Student) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({
          nom: updatedStudent.nom,
          prenom: updatedStudent.prenom,
          sexe: updatedStudent.sexe,
          date_naissance: updatedStudent.dateNaissance,
          classe: updatedStudent.classe,
          contact_parent: updatedStudent.contactParent,
          email_parent: updatedStudent.emailParent,
          date_inscription: updatedStudent.dateInscription,
          statut: updatedStudent.statut,
          updated_at: new Date().toISOString()
        })
        .eq('matricule', matricule);

      if (error) {
        console.log('Error updating student:', error);
        throw error;
      }

      await loadStudents();
    } catch (error) {
      console.log('Error updating student:', error);
      throw error;
    }
  };

  const deleteStudent = async (matricule: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('matricule', matricule);

      if (error) {
        console.log('Error deleting student:', error);
        throw error;
      }

      await loadStudents();
    } catch (error) {
      console.log('Error deleting student:', error);
      throw error;
    }
  };

  const searchStudents = (query: string) => {
    if (!query.trim()) return students;
    
    const lowercaseQuery = query.toLowerCase();
    return students.filter(student => 
      student.matricule.toLowerCase().includes(lowercaseQuery) ||
      student.nom.toLowerCase().includes(lowercaseQuery) ||
      student.prenom.toLowerCase().includes(lowercaseQuery) ||
      student.contactParent.includes(query) ||
      student.classe.toLowerCase().includes(lowercaseQuery)
    );
  };

  const importStudentsFromFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        return { success: false, message: 'Import annulé' };
      }

      const file = result.assets[0];
      const response = await fetch(file.uri);
      const arrayBuffer = await response.arrayBuffer();
      
      let studentsData: any[] = [];

      if (file.name.endsWith('.xlsx')) {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        studentsData = XLSX.utils.sheet_to_json(worksheet);
      } else if (file.name.endsWith('.csv')) {
        const text = new TextDecoder().decode(arrayBuffer);
        const workbook = XLSX.read(text, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        studentsData = XLSX.utils.sheet_to_json(worksheet);
      }

      let importedCount = 0;
      let errors: string[] = [];

      for (const row of studentsData) {
        try {
          const student: Student = {
            matricule: row.matricule || row.Matricule || '',
            nom: row.nom || row.Nom || '',
            prenom: row.prenom || row.Prenom || row.Prénom || '',
            sexe: (row.sexe || row.Sexe || 'M').toUpperCase() as 'M' | 'F',
            dateNaissance: row.dateNaissance || row.date_naissance || row['Date de naissance'] || '',
            classe: row.classe || row.Classe || '',
            contactParent: row.contactParent || row.contact_parent || row['Contact parent'] || '',
            emailParent: row.emailParent || row.email_parent || row['Email parent'] || '',
            dateInscription: row.dateInscription || row.date_inscription || row['Date inscription'] || new Date().toISOString().split('T')[0],
            statut: (row.statut || row.Statut || 'actif') as 'actif' | 'inactif' | 'suspendu'
          };

          if (!student.matricule || !student.nom || !student.prenom) {
            errors.push(`Ligne ignorée: données manquantes (matricule: ${student.matricule})`);
            continue;
          }

          await addStudent(student);
          importedCount++;
        } catch (error) {
          errors.push(`Erreur pour ${row.matricule || 'matricule inconnu'}: ${error}`);
        }
      }

      return {
        success: true,
        message: `${importedCount} élèves importés avec succès`,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.log('Error importing students:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'import: ' + error
      };
    }
  };

  const exportStudentsToExcel = async (filteredStudents?: Student[]) => {
    try {
      const dataToExport = filteredStudents || students;
      const exportData = dataToExport.map(student => ({
        'Matricule': student.matricule,
        'Nom': student.nom,
        'Prénom': student.prenom,
        'Sexe': student.sexe,
        'Date de naissance': student.dateNaissance,
        'Classe': student.classe,
        'Contact parent': student.contactParent,
        'Email parent': student.emailParent || '',
        'Date inscription': student.dateInscription,
        'Statut': student.statut
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Élèves');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      return {
        success: true,
        data: excelBuffer,
        filename: `eleves_${new Date().toISOString().split('T')[0]}.xlsx`
      };
    } catch (error) {
      console.log('Error exporting students:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'export: ' + error
      };
    }
  };

  return {
    students,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
    refreshStudents: loadStudents,
    importStudentsFromFile,
    exportStudentsToExcel
  };
};

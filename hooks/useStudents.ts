
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Student } from '../types';
import { mockStudents } from '../data/mockData';

const STUDENTS_KEY = 'gesecolage_students';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const studentsData = await AsyncStorage.getItem(STUDENTS_KEY);
      if (studentsData) {
        setStudents(JSON.parse(studentsData));
      } else {
        // Charger les données mock la première fois
        setStudents(mockStudents);
        await AsyncStorage.setItem(STUDENTS_KEY, JSON.stringify(mockStudents));
      }
    } catch (error) {
      console.log('Error loading students:', error);
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (student: Student) => {
    try {
      const updatedStudents = [...students, student];
      setStudents(updatedStudents);
      await AsyncStorage.setItem(STUDENTS_KEY, JSON.stringify(updatedStudents));
    } catch (error) {
      console.log('Error adding student:', error);
    }
  };

  const updateStudent = async (matricule: string, updatedStudent: Student) => {
    try {
      const updatedStudents = students.map(s => 
        s.matricule === matricule ? updatedStudent : s
      );
      setStudents(updatedStudents);
      await AsyncStorage.setItem(STUDENTS_KEY, JSON.stringify(updatedStudents));
    } catch (error) {
      console.log('Error updating student:', error);
    }
  };

  const deleteStudent = async (matricule: string) => {
    try {
      const updatedStudents = students.filter(s => s.matricule !== matricule);
      setStudents(updatedStudents);
      await AsyncStorage.setItem(STUDENTS_KEY, JSON.stringify(updatedStudents));
    } catch (error) {
      console.log('Error deleting student:', error);
    }
  };

  const searchStudents = (query: string) => {
    if (!query.trim()) return students;
    
    const lowercaseQuery = query.toLowerCase();
    return students.filter(student => 
      student.matricule.toLowerCase().includes(lowercaseQuery) ||
      student.nom.toLowerCase().includes(lowercaseQuery) ||
      student.prenom.toLowerCase().includes(lowercaseQuery) ||
      student.contactParent.includes(query)
    );
  };

  return {
    students,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
    refreshStudents: loadStudents
  };
};

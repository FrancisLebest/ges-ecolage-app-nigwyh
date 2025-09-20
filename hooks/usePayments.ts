
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Payment, StudentBalance, DashboardStats } from '../types';
import { mockPayments, mockFees } from '../data/mockData';
import { useStudents } from './useStudents';

const PAYMENTS_KEY = 'gesecolage_payments';

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { students } = useStudents();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const paymentsData = await AsyncStorage.getItem(PAYMENTS_KEY);
      if (paymentsData) {
        setPayments(JSON.parse(paymentsData));
      } else {
        setPayments(mockPayments);
        await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(mockPayments));
      }
    } catch (error) {
      console.log('Error loading payments:', error);
      setPayments(mockPayments);
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (payment: Payment) => {
    try {
      const updatedPayments = [...payments, payment];
      setPayments(updatedPayments);
      await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(updatedPayments));
    } catch (error) {
      console.log('Error adding payment:', error);
    }
  };

  const getStudentBalances = (): StudentBalance[] => {
    return students.map(student => {
      const studentPayments = payments.filter(p => p.matricule === student.matricule);
      const totalPaye = studentPayments.reduce((sum, p) => sum + p.montantPaye, 0);
      
      // Calcul du total dû (tous les frais obligatoires)
      const totalDu = mockFees
        .filter(fee => fee.obligatoire)
        .reduce((sum, fee) => sum + fee.montant, 0);
      
      const resteAPayer = totalDu - totalPaye;
      
      return {
        matricule: student.matricule,
        nom: student.nom,
        prenom: student.prenom,
        classe: student.classe,
        totalDu,
        totalPaye,
        resteAPayer,
        statut: resteAPayer <= 0 ? 'solde' : 'non_solde'
      };
    });
  };

  const getDashboardStats = (): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);

    const todayPayments = payments.filter(p => p.datePaiement === today);
    const weekPayments = payments.filter(p => new Date(p.datePaiement) >= thisWeekStart);
    const monthPayments = payments.filter(p => new Date(p.datePaiement) >= thisMonthStart);

    const totalEncaisseAujourdhui = todayPayments.reduce((sum, p) => sum + p.montantPaye, 0);
    const totalEncaisseSemaine = weekPayments.reduce((sum, p) => sum + p.montantPaye, 0);
    const totalEncaisseMois = monthPayments.reduce((sum, p) => sum + p.montantPaye, 0);

    const balances = getStudentBalances();
    const elevesSoldes = balances.filter(b => b.statut === 'solde').length;
    const pourcentageElevesSoldes = (elevesSoldes / balances.length) * 100;

    // Top classes par recouvrement
    const classeStats = new Map<string, { total: number, paye: number }>();
    balances.forEach(balance => {
      const current = classeStats.get(balance.classe) || { total: 0, paye: 0 };
      classeStats.set(balance.classe, {
        total: current.total + balance.totalDu,
        paye: current.paye + balance.totalPaye
      });
    });

    const topClassesRecouvrement = Array.from(classeStats.entries())
      .map(([classe, stats]) => ({
        classe,
        pourcentage: (stats.paye / stats.total) * 100,
        montant: stats.paye
      }))
      .sort((a, b) => b.pourcentage - a.pourcentage)
      .slice(0, 5);

    return {
      totalEncaisseAujourdhui,
      totalEncaisseSemaine,
      totalEncaisseMois,
      nombrePaiements: payments.length,
      pourcentageElevesSoldes,
      topClassesRecouvrement
    };
  };

  return {
    payments,
    loading,
    addPayment,
    getStudentBalances,
    getDashboardStats,
    refreshPayments: loadPayments
  };
};

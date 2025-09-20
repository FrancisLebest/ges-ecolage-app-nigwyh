
import { useState, useEffect } from 'react';
import { supabase } from '../app/integrations/supabase/client';
import { Payment, StudentBalance, DashboardStats } from '../types';
import { useSupabaseStudents } from './useSupabaseStudents';
import { useSupabaseFees } from './useSupabaseFees';

export const useSupabasePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { students } = useSupabaseStudents();
  const { fees, getFeesForClass } = useSupabaseFees();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('date_paiement', { ascending: false });

      if (error) {
        console.log('Error loading payments:', error);
        return;
      }

      const formattedPayments: Payment[] = data.map(payment => ({
        id: payment.id,
        datePaiement: payment.date_paiement,
        matricule: payment.matricule,
        codeFrais: payment.code_frais,
        montantPaye: parseFloat(payment.montant_paye),
        mode: payment.mode,
        numPiece: payment.num_piece,
        caissier: payment.caissier,
        commentaires: payment.commentaires
      }));

      setPayments(formattedPayments);
    } catch (error) {
      console.log('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (payment: Payment) => {
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          date_paiement: payment.datePaiement,
          matricule: payment.matricule,
          code_frais: payment.codeFrais,
          montant_paye: payment.montantPaye,
          mode: payment.mode,
          num_piece: payment.numPiece,
          caissier: payment.caissier,
          commentaires: payment.commentaires
        });

      if (error) {
        console.log('Error adding payment:', error);
        throw error;
      }

      await loadPayments();
    } catch (error) {
      console.log('Error adding payment:', error);
      throw error;
    }
  };

  const getStudentBalances = (): StudentBalance[] => {
    return students.map(student => {
      const studentPayments = payments.filter(p => p.matricule === student.matricule);
      const totalPaye = studentPayments.reduce((sum, p) => sum + p.montantPaye, 0);
      
      // Calcul du total dû basé sur les frais de la classe + frais obligatoires
      const classeFees = getFeesForClass(student.classe);
      const totalDu = classeFees.reduce((sum, fee) => sum + fee.montant, 0);
      
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
    const pourcentageElevesSoldes = balances.length > 0 ? (elevesSoldes / balances.length) * 100 : 0;

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
        pourcentage: stats.total > 0 ? (stats.paye / stats.total) * 100 : 0,
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

  const getPaymentsByPeriod = (startDate: string, endDate: string) => {
    return payments.filter(p => 
      p.datePaiement >= startDate && p.datePaiement <= endDate
    );
  };

  const getPaymentsByMode = () => {
    const modeStats = new Map<string, { count: number, total: number }>();
    
    payments.forEach(payment => {
      const current = modeStats.get(payment.mode) || { count: 0, total: 0 };
      modeStats.set(payment.mode, {
        count: current.count + 1,
        total: current.total + payment.montantPaye
      });
    });

    return Array.from(modeStats.entries()).map(([mode, stats]) => ({
      mode,
      count: stats.count,
      total: stats.total
    }));
  };

  const getStudentPaymentHistory = (matricule: string) => {
    return payments
      .filter(p => p.matricule === matricule)
      .sort((a, b) => new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime());
  };

  return {
    payments,
    loading,
    addPayment,
    getStudentBalances,
    getDashboardStats,
    getPaymentsByPeriod,
    getPaymentsByMode,
    getStudentPaymentHistory,
    refreshPayments: loadPayments
  };
};

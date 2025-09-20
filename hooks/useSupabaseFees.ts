
import { useState, useEffect } from 'react';
import { supabase } from '../app/integrations/supabase/client';

export interface Fee {
  id?: string;
  code: string;
  description: string;
  montant: number;
  classe?: string;
  obligatoire: boolean;
  periodicite?: string;
}

export interface ClassFee {
  id?: string;
  classe: string;
  codeFrais: string;
}

export const useSupabaseFees = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [classFees, setClassFees] = useState<ClassFee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFees();
    loadClassFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .order('code', { ascending: true });

      if (error) {
        console.log('Error loading fees:', error);
        return;
      }

      const formattedFees: Fee[] = data.map(fee => ({
        id: fee.id,
        code: fee.code,
        description: fee.description,
        montant: parseFloat(fee.montant),
        classe: fee.classe,
        obligatoire: fee.obligatoire,
        periodicite: fee.periodicite
      }));

      setFees(formattedFees);
    } catch (error) {
      console.log('Error loading fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassFees = async () => {
    try {
      const { data, error } = await supabase
        .from('class_fees')
        .select('*');

      if (error) {
        console.log('Error loading class fees:', error);
        return;
      }

      const formattedClassFees: ClassFee[] = data.map(cf => ({
        id: cf.id,
        classe: cf.classe,
        codeFrais: cf.code_frais
      }));

      setClassFees(formattedClassFees);
    } catch (error) {
      console.log('Error loading class fees:', error);
    }
  };

  const addFee = async (fee: Fee) => {
    try {
      const { error } = await supabase
        .from('fees')
        .insert({
          code: fee.code,
          description: fee.description,
          montant: fee.montant,
          classe: fee.classe,
          obligatoire: fee.obligatoire,
          periodicite: fee.periodicite
        });

      if (error) {
        console.log('Error adding fee:', error);
        throw error;
      }

      await loadFees();
    } catch (error) {
      console.log('Error adding fee:', error);
      throw error;
    }
  };

  const updateFee = async (code: string, updatedFee: Fee) => {
    try {
      const { error } = await supabase
        .from('fees')
        .update({
          description: updatedFee.description,
          montant: updatedFee.montant,
          classe: updatedFee.classe,
          obligatoire: updatedFee.obligatoire,
          periodicite: updatedFee.periodicite,
          updated_at: new Date().toISOString()
        })
        .eq('code', code);

      if (error) {
        console.log('Error updating fee:', error);
        throw error;
      }

      await loadFees();
    } catch (error) {
      console.log('Error updating fee:', error);
      throw error;
    }
  };

  const deleteFee = async (code: string) => {
    try {
      const { error } = await supabase
        .from('fees')
        .delete()
        .eq('code', code);

      if (error) {
        console.log('Error deleting fee:', error);
        throw error;
      }

      await loadFees();
    } catch (error) {
      console.log('Error deleting fee:', error);
      throw error;
    }
  };

  const associateFeeToClass = async (classe: string, codeFrais: string) => {
    try {
      const { error } = await supabase
        .from('class_fees')
        .insert({
          classe,
          code_frais: codeFrais
        });

      if (error) {
        console.log('Error associating fee to class:', error);
        throw error;
      }

      await loadClassFees();
    } catch (error) {
      console.log('Error associating fee to class:', error);
      throw error;
    }
  };

  const removeClassFeeAssociation = async (classe: string, codeFrais: string) => {
    try {
      const { error } = await supabase
        .from('class_fees')
        .delete()
        .eq('classe', classe)
        .eq('code_frais', codeFrais);

      if (error) {
        console.log('Error removing class fee association:', error);
        throw error;
      }

      await loadClassFees();
    } catch (error) {
      console.log('Error removing class fee association:', error);
      throw error;
    }
  };

  const getFeesForClass = (classe: string): Fee[] => {
    const classFeeCodes = classFees
      .filter(cf => cf.classe === classe)
      .map(cf => cf.codeFrais);
    
    return fees.filter(fee => 
      fee.obligatoire || classFeeCodes.includes(fee.code)
    );
  };

  return {
    fees,
    classFees,
    loading,
    addFee,
    updateFee,
    deleteFee,
    associateFeeToClass,
    removeClassFeeAssociation,
    getFeesForClass,
    refreshFees: loadFees,
    refreshClassFees: loadClassFees
  };
};

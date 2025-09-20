
// This script would be run once to initialize the database with sample data
// In a real app, you would run this as a migration or setup script

import { supabase } from '../app/integrations/supabase/client';

export const initializeData = async () => {
  try {
    console.log('Initializing sample data...');

    // Insert sample users
    const { error: usersError } = await supabase
      .from('app_users')
      .upsert([
        {
          username: 'admin',
          role: 'admin',
          name: 'Administrateur Principal',
          email: 'admin@gesecolage.com',
          password_hash: 'hashed_password_123' // In real app, use proper hashing
        },
        {
          username: 'caissier1',
          role: 'caissier',
          name: 'Marie Dupont',
          email: 'marie@gesecolage.com',
          password_hash: 'hashed_password_123'
        }
      ], { onConflict: 'username' });

    if (usersError) {
      console.log('Error inserting users:', usersError);
    }

    // Insert sample fees
    const { error: feesError } = await supabase
      .from('fees')
      .upsert([
        {
          code: 'SCOL001',
          description: 'Frais de scolarité - Trimestre 1',
          montant: 150000,
          obligatoire: true
        },
        {
          code: 'SCOL002',
          description: 'Frais de scolarité - Trimestre 2',
          montant: 150000,
          obligatoire: true
        },
        {
          code: 'SCOL003',
          description: 'Frais de scolarité - Trimestre 3',
          montant: 150000,
          obligatoire: true
        },
        {
          code: 'INSC001',
          description: 'Frais d\'inscription',
          montant: 25000,
          obligatoire: true
        },
        {
          code: 'FOUR001',
          description: 'Fournitures scolaires',
          montant: 35000,
          obligatoire: false
        },
        {
          code: 'CANT001',
          description: 'Cantine - Trimestre 1',
          montant: 45000,
          obligatoire: false
        }
      ], { onConflict: 'code' });

    if (feesError) {
      console.log('Error inserting fees:', feesError);
    }

    // Insert sample students
    const { error: studentsError } = await supabase
      .from('students')
      .upsert([
        {
          matricule: 'ETU001',
          nom: 'KOUAME',
          prenom: 'Jean',
          sexe: 'M',
          date_naissance: '2005-03-15',
          classe: '6ème A',
          contact_parent: '+225 07 12 34 56 78',
          email_parent: 'kouame.parent@email.com',
          date_inscription: '2024-09-01',
          statut: 'actif'
        },
        {
          matricule: 'ETU002',
          nom: 'TRAORE',
          prenom: 'Fatou',
          sexe: 'F',
          date_naissance: '2004-07-22',
          classe: '5ème B',
          contact_parent: '+225 05 98 76 54 32',
          email_parent: 'traore.parent@email.com',
          date_inscription: '2024-09-01',
          statut: 'actif'
        },
        {
          matricule: 'ETU003',
          nom: 'KONE',
          prenom: 'Amadou',
          sexe: 'M',
          date_naissance: '2006-11-08',
          classe: '6ème A',
          contact_parent: '+225 01 23 45 67 89',
          email_parent: 'kone.parent@email.com',
          date_inscription: '2024-09-01',
          statut: 'actif'
        },
        {
          matricule: 'ETU004',
          nom: 'OUATTARA',
          prenom: 'Aïcha',
          sexe: 'F',
          date_naissance: '2003-12-03',
          classe: '4ème C',
          contact_parent: '+225 07 11 22 33 44',
          email_parent: 'ouattara.parent@email.com',
          date_inscription: '2024-09-01',
          statut: 'actif'
        }
      ], { onConflict: 'matricule' });

    if (studentsError) {
      console.log('Error inserting students:', studentsError);
    }

    // Insert sample payments
    const { error: paymentsError } = await supabase
      .from('payments')
      .upsert([
        {
          date_paiement: '2024-01-15',
          matricule: 'ETU001',
          code_frais: 'SCOL001',
          montant_paye: 150000,
          mode: 'especes',
          caissier: 'caissier1',
          commentaires: 'Paiement complet trimestre 1'
        },
        {
          date_paiement: '2024-01-16',
          matricule: 'ETU001',
          code_frais: 'INSC001',
          montant_paye: 25000,
          mode: 'especes',
          caissier: 'caissier1'
        },
        {
          date_paiement: '2024-01-20',
          matricule: 'ETU002',
          code_frais: 'SCOL001',
          montant_paye: 75000,
          mode: 'mobile',
          num_piece: 'MOB123456',
          caissier: 'caissier1',
          commentaires: 'Paiement partiel - reste 75000'
        },
        {
          date_paiement: '2024-01-22',
          matricule: 'ETU003',
          code_frais: 'INSC001',
          montant_paye: 25000,
          mode: 'cheque',
          num_piece: 'CHQ789012',
          caissier: 'admin'
        }
      ]);

    if (paymentsError) {
      console.log('Error inserting payments:', paymentsError);
    }

    console.log('Sample data initialized successfully!');
    return { success: true };

  } catch (error) {
    console.log('Error initializing data:', error);
    return { success: false, error };
  }
};

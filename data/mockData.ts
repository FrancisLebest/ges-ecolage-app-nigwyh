
import { Student, Fee, Payment, User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    role: 'admin',
    name: 'Administrateur Principal',
    email: 'admin@gesecolage.com'
  },
  {
    id: '2',
    username: 'caissier1',
    role: 'caissier',
    name: 'Marie Dupont',
    email: 'marie@gesecolage.com'
  }
];

export const mockStudents: Student[] = [
  {
    matricule: 'ETU001',
    nom: 'KOUAME',
    prenom: 'Jean',
    sexe: 'M',
    dateNaissance: '2005-03-15',
    classe: '6ème A',
    contactParent: '+225 07 12 34 56 78',
    emailParent: 'kouame.parent@email.com',
    dateInscription: '2024-09-01',
    statut: 'actif'
  },
  {
    matricule: 'ETU002',
    nom: 'TRAORE',
    prenom: 'Fatou',
    sexe: 'F',
    dateNaissance: '2004-07-22',
    classe: '5ème B',
    contactParent: '+225 05 98 76 54 32',
    emailParent: 'traore.parent@email.com',
    dateInscription: '2024-09-01',
    statut: 'actif'
  },
  {
    matricule: 'ETU003',
    nom: 'KONE',
    prenom: 'Amadou',
    sexe: 'M',
    dateNaissance: '2006-11-08',
    classe: '6ème A',
    contactParent: '+225 01 23 45 67 89',
    emailParent: 'kone.parent@email.com',
    dateInscription: '2024-09-01',
    statut: 'actif'
  },
  {
    matricule: 'ETU004',
    nom: 'OUATTARA',
    prenom: 'Aïcha',
    sexe: 'F',
    dateNaissance: '2003-12-03',
    classe: '4ème C',
    contactParent: '+225 07 11 22 33 44',
    emailParent: 'ouattara.parent@email.com',
    dateInscription: '2024-09-01',
    statut: 'actif'
  }
];

export const mockFees: Fee[] = [
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
];

export const mockPayments: Payment[] = [
  {
    id: 'PAY001',
    datePaiement: '2024-01-15',
    matricule: 'ETU001',
    codeFrais: 'SCOL001',
    montantPaye: 150000,
    mode: 'especes',
    caissier: 'caissier1',
    commentaires: 'Paiement complet trimestre 1'
  },
  {
    id: 'PAY002',
    datePaiement: '2024-01-16',
    matricule: 'ETU001',
    codeFrais: 'INSC001',
    montantPaye: 25000,
    mode: 'especes',
    caissier: 'caissier1'
  },
  {
    id: 'PAY003',
    datePaiement: '2024-01-20',
    matricule: 'ETU002',
    codeFrais: 'SCOL001',
    montantPaye: 75000,
    mode: 'mobile',
    numPiece: 'MOB123456',
    caissier: 'caissier1',
    commentaires: 'Paiement partiel - reste 75000'
  },
  {
    id: 'PAY004',
    datePaiement: '2024-01-22',
    matricule: 'ETU003',
    codeFrais: 'INSC001',
    montantPaye: 25000,
    mode: 'cheque',
    numPiece: 'CHQ789012',
    caissier: 'admin'
  }
];

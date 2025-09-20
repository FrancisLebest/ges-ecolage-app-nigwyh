
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'caissier';
  name: string;
  email?: string;
}

export interface Student {
  matricule: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  classe: string;
  contactParent: string;
  emailParent?: string;
  dateInscription: string;
  statut: 'actif' | 'inactif' | 'suspendu';
}

export interface Fee {
  code: string;
  description: string;
  montant: number;
  classe?: string;
  obligatoire: boolean;
}

export interface Payment {
  id: string;
  datePaiement: string;
  matricule: string;
  codeFrais: string;
  montantPaye: number;
  mode: 'especes' | 'cheque' | 'virement' | 'mobile';
  numPiece?: string;
  caissier: string;
  commentaires?: string;
}

export interface StudentBalance {
  matricule: string;
  nom: string;
  prenom: string;
  classe: string;
  totalDu: number;
  totalPaye: number;
  resteAPayer: number;
  statut: 'solde' | 'non_solde';
}

export interface DashboardStats {
  totalEncaisseAujourdhui: number;
  totalEncaisseSemaine: number;
  totalEncaisseMois: number;
  nombrePaiements: number;
  pourcentageElevesSoldes: number;
  topClassesRecouvrement: Array<{
    classe: string;
    pourcentage: number;
    montant: number;
  }>;
}

export interface PaymentReport {
  periode: string;
  totalPaiements: number;
  nombreTransactions: number;
  paiementsParMode: Record<string, number>;
  paiementsParClasse: Record<string, number>;
}

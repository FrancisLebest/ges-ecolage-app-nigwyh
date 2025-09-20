
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Student, Payment, Fee, StudentBalance } from '../types';

export interface ReceiptData {
  student: Student;
  payment: Payment;
  fee: Fee;
  balance: StudentBalance;
}

export const generateReceiptHTML = (data: ReceiptData): string => {
  const { student, payment, fee, balance } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Reçu de Paiement</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .receipt {
                background: white;
                max-width: 600px;
                margin: 0 auto;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #1976D2;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #1976D2;
                margin-bottom: 10px;
            }
            .school-info {
                color: #666;
                font-size: 14px;
            }
            .receipt-title {
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                color: #333;
                margin: 20px 0;
            }
            .info-section {
                margin-bottom: 25px;
            }
            .info-title {
                font-weight: bold;
                color: #1976D2;
                font-size: 16px;
                margin-bottom: 10px;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 5px 0;
            }
            .info-label {
                font-weight: 500;
                color: #555;
            }
            .info-value {
                color: #333;
            }
            .amount-section {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .amount {
                font-size: 24px;
                font-weight: bold;
                color: #4CAF50;
                text-align: center;
            }
            .balance-info {
                background-color: #e3f2fd;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 12px;
            }
            .signature-section {
                display: flex;
                justify-content: space-between;
                margin-top: 40px;
            }
            .signature-box {
                text-align: center;
                width: 200px;
            }
            .signature-line {
                border-top: 1px solid #333;
                margin-top: 50px;
                padding-top: 5px;
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <div class="header">
                <div class="logo">GesEcolage</div>
                <div class="school-info">
                    Système de Gestion de Scolarité<br>
                    Email: contact@gesecolage.com<br>
                    Tél: +225 XX XX XX XX XX
                </div>
            </div>
            
            <div class="receipt-title">REÇU DE PAIEMENT</div>
            
            <div class="info-section">
                <div class="info-title">Informations Élève</div>
                <div class="info-row">
                    <span class="info-label">Matricule:</span>
                    <span class="info-value">${student.matricule}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Nom complet:</span>
                    <span class="info-value">${student.nom} ${student.prenom}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Classe:</span>
                    <span class="info-value">${student.classe}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Contact Parent:</span>
                    <span class="info-value">${student.contactParent}</span>
                </div>
            </div>
            
            <div class="info-section">
                <div class="info-title">Détails du Paiement</div>
                <div class="info-row">
                    <span class="info-label">Date:</span>
                    <span class="info-value">${new Date(payment.datePaiement).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Frais:</span>
                    <span class="info-value">${fee.description}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mode de paiement:</span>
                    <span class="info-value">${payment.mode.toUpperCase()}</span>
                </div>
                ${payment.numPiece ? `
                <div class="info-row">
                    <span class="info-label">N° Pièce:</span>
                    <span class="info-value">${payment.numPiece}</span>
                </div>
                ` : ''}
                <div class="info-row">
                    <span class="info-label">Caissier:</span>
                    <span class="info-value">${payment.caissier}</span>
                </div>
            </div>
            
            <div class="amount-section">
                <div class="amount">${payment.montantPaye.toLocaleString()} FCFA</div>
                <div style="text-align: center; margin-top: 10px; color: #666;">
                    Montant payé
                </div>
            </div>
            
            <div class="balance-info">
                <div class="info-title">Situation du Compte</div>
                <div class="info-row">
                    <span class="info-label">Total dû:</span>
                    <span class="info-value">${balance.totalDu.toLocaleString()} FCFA</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Total payé:</span>
                    <span class="info-value">${balance.totalPaye.toLocaleString()} FCFA</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Reste à payer:</span>
                    <span class="info-value" style="color: ${balance.resteAPayer <= 0 ? '#4CAF50' : '#FF5722'};">
                        ${balance.resteAPayer.toLocaleString()} FCFA
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Statut:</span>
                    <span class="info-value" style="color: ${balance.statut === 'solde' ? '#4CAF50' : '#FF5722'};">
                        ${balance.statut === 'solde' ? 'SOLDÉ' : 'NON SOLDÉ'}
                    </span>
                </div>
            </div>
            
            ${payment.commentaires ? `
            <div class="info-section">
                <div class="info-title">Commentaires</div>
                <div style="font-style: italic; color: #666;">${payment.commentaires}</div>
            </div>
            ` : ''}
            
            <div class="signature-section">
                <div class="signature-box">
                    <div>Signature du Caissier</div>
                    <div class="signature-line">${payment.caissier}</div>
                </div>
                <div class="signature-box">
                    <div>Signature du Parent/Élève</div>
                    <div class="signature-line"></div>
                </div>
            </div>
            
            <div class="footer">
                Reçu généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}<br>
                Ce reçu fait foi de paiement - À conserver précieusement
            </div>
        </div>
    </body>
    </html>
  `;
};

export const generateStudentListHTML = (students: Student[], balances: StudentBalance[]): string => {
  const balanceMap = new Map(balances.map(b => [b.matricule, b]));
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Liste des Élèves</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .report {
                background: white;
                margin: 0 auto;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #1976D2;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #1976D2;
                margin-bottom: 10px;
            }
            .report-title {
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                color: #333;
                margin: 20px 0;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            th {
                background-color: #1976D2;
                color: white;
                font-weight: bold;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .status-solde {
                color: #4CAF50;
                font-weight: bold;
            }
            .status-non-solde {
                color: #FF5722;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 12px;
            }
            .summary {
                background-color: #e3f2fd;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="report">
            <div class="header">
                <div class="logo">GesEcolage</div>
                <div>Système de Gestion de Scolarité</div>
            </div>
            
            <div class="report-title">LISTE DES ÉLÈVES</div>
            
            <div class="summary">
                <strong>Résumé:</strong><br>
                Total élèves: ${students.length}<br>
                Élèves soldés: ${balances.filter(b => b.statut === 'solde').length}<br>
                Élèves non soldés: ${balances.filter(b => b.statut === 'non_solde').length}<br>
                Généré le: ${new Date().toLocaleDateString('fr-FR')}
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Matricule</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Classe</th>
                        <th>Total Dû</th>
                        <th>Total Payé</th>
                        <th>Reste</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => {
                      const balance = balanceMap.get(student.matricule);
                      return `
                        <tr>
                            <td>${student.matricule}</td>
                            <td>${student.nom}</td>
                            <td>${student.prenom}</td>
                            <td>${student.classe}</td>
                            <td>${balance ? balance.totalDu.toLocaleString() : '0'} FCFA</td>
                            <td>${balance ? balance.totalPaye.toLocaleString() : '0'} FCFA</td>
                            <td>${balance ? balance.resteAPayer.toLocaleString() : '0'} FCFA</td>
                            <td class="${balance?.statut === 'solde' ? 'status-solde' : 'status-non-solde'}">
                                ${balance?.statut === 'solde' ? 'SOLDÉ' : 'NON SOLDÉ'}
                            </td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
            </div>
        </div>
    </body>
    </html>
  `;
};

export const printReceipt = async (data: ReceiptData): Promise<{ success: boolean; message?: string }> => {
  try {
    const html = generateReceiptHTML(data);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Partager le reçu',
      });
    }

    return { success: true, message: 'Reçu généré avec succès' };
  } catch (error) {
    console.log('Error printing receipt:', error);
    return { success: false, message: 'Erreur lors de la génération du reçu' };
  }
};

export const printStudentList = async (students: Student[], balances: StudentBalance[]): Promise<{ success: boolean; message?: string }> => {
  try {
    const html = generateStudentListHTML(students, balances);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Partager la liste des élèves',
      });
    }

    return { success: true, message: 'Liste générée avec succès' };
  } catch (error) {
    console.log('Error printing student list:', error);
    return { success: false, message: 'Erreur lors de la génération de la liste' };
  }
};

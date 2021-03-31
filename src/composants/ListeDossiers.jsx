import './ListeDossiers.scss';
import Dossier from './Dossier';
import * as crudDossiers from '../services/crud-dossiers';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  }
}));


export default function ListeDossiers({utilisateur, etatDossiers, valeurTriDossier}) {

  const classes = useStyles();
  const [trier, setTrier] = valeurTriDossier;
  const [Ouvrir, setOuvrir] = useState(false);
  // État des dossiers (vient du composant Appli)
  const [dossiers, setDossiers] = etatDossiers;

  const triFermer = () => {
    setOuvrir(false);
  };

  const triOuver = () => {
    setOuvrir(true);
  };


  // Lire les dossiers dans Firestore et forcer le réaffichage du composant
  // Remarquez que ce code est dans un useEffect() car on veut l'exécuter 
  // UNE SEULE FOIS (regardez le tableau des 'deps' - dépendances) et ceci 
  // APRÈS l'affichage du composant pour que la requête asynchrone à Firestore  
  // ait eu le temps d'être complétée et le réaffichage du composant soit
  // forcé par la mutation de l'état des dossiers
  useEffect(
    () => {
      crudDossiers.lireTout(utilisateur.uid,trier).then(
        dossiers => setDossiers(dossiers)
      )
    }, [trier]
  );

  /**
   * Gérer le clic du bouton 'supprimer' correspondant au dossier identifié en argument
   * @param {string} idd identifiant Firestore du dossier
   */
  async function gererSupprimer(idd) {
    // On fait appel à la méthode supprimer de notre code d'interaction avec Firestore
    crudDossiers.supprimer(utilisateur.uid, idd).then(
      () => {
        const tempDossiers = [...dossiers]; // copier le tableau des dossiers existants
        const dossiersRestants = tempDossiers.filter((elt) => elt.id!==idd); // filtrer pour garder tous les dossiers sauf celui qu'on a demandé de supprimer
        setDossiers(dossiersRestants); // Muter l'état pour forcer le réaffichage du composant
      }).catch(erreur => console.log('Échec de la suppression - Firestore a répondu :', erreur.message));
  }


  return (
    <>

    <FormControl className={classes.formControl}>
      <InputLabel id="demo-controlled-Ouvrir-select-label">Tri de dossiers</InputLabel>
      <Select
        labelId="demo-controlled-Ouvrir-select-label"
        id="demo-controlled-Ouvrir-select"
        open={Ouvrir}
        onClose={triFermer}
        onOpen={triOuver}
        defaultValue={0}
        value={trier}
        onChange={ (event) => {
          setTrier(event.target.value);
        }}
      >

        <MenuItem value={0}>Date de dossier descendant </MenuItem>
        <MenuItem value={1}>Nom de dossier descendant</MenuItem>
        <MenuItem value={2}>Nom de dossier ascendant</MenuItem>
      </Select>
    </FormControl>
    

    <ul className="ListeDossiers">
      {
        (dossiers.length > 0) ?
          dossiers.map(dossier => <li key={dossier.id}><Dossier {...dossier} gererSupprimer={gererSupprimer} /></li>)
        :
          <li className="msgAucunDossier">
            Votre liste de dossiers est vide 
            <p>;-(</p>
          </li>
      }
    </ul>
    </>
  );



  
}


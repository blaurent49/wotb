#ifndef DUNITER_H
#define DUNITER_H

#include <cstdint>
#include <cstddef>
#include <vector>
#include "webOfTrust.h"
#include "simulation/IdentityPool.h"
#include "simulation/CertificationPool.h"


namespace libsimu {

  using namespace std;
  using namespace libwot;

  class Duniter {

    public :

      Duniter(int dureeSimulationEnBlocks, double xPercent, uint32_t stepMax, uint32_t minNew, double maxNewPercent, uint32_t sigMoy, uint32_t sigStock, uint32_t sigQty, uint32_t sigPeriod);
      ~Duniter();

      /**
       * Crée la communauté initiale, circulairement signée.
       */
      void creeBlockInitialEtSaCommunaute();

      /**
       * Mécanique principale qui exclut les membres ne répondant plus aux critères et tente d'ajouter
       * un maximum de nouveaux membres selon les règles établies.
       */
      void ajouteUnBloc();
      void alimenteLesPiscines();
      void afficheStats();

      unsigned int blocCourant = 0;
      int NOMBRE_DE_BLOCKS_DE_SIMULATION;
      uint32_t STEPMAX;
      uint32_t SIG_STOCK;
      uint32_t SIG_QTY;
      uint32_t SIG_VALIDITY;
      uint32_t SIG_PERIOD;
      uint32_t COMMUNAUTE_INITIALE;
      uint32_t MIN_NEW;
      double MAX_NEW_PERCENT;
      double X_PERCENT;
      WebOfTrust* wot;
      IdentityPool* iPool;
      CertificationPool* cPool;
      vector<Certification> wotLinks;
  };
}

#endif
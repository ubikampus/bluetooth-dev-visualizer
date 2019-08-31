import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import { Transition } from 'react-spring/renderprops';

import AboutContainer from './aboutContainer';
import SettingsContainer from './settingsContainer';
import MapContainer from './map/mapContainer';
import AdminPanel, { AndroidLocation } from './admin/adminPanel';
import { Location } from './common/typeUtil';
import NavBar from './common/navBar';

import LoginPromptContainer from './admin/loginPromptContainer';
import AuthApi, { Admin } from './admin/authApi';
import TokenStore, {
  ADMIN_STORE_ID,
  BEACON_STORE_ID,
} from './common/tokenStore';
import mqttClient from './common/mqttClient';
import ShareLocationApi, { Beacon } from './map/shareLocationApi';
import { PublicBeacon } from './map/shareLocationApi';
import PublicBeacons from './map/publicBeacons';
import BeaconIdModal from './map/beaconIdModal';
import ShareLocationModal from './map/shareLocationModal';
import PublicShareModal from './map/publicShareModal';
import { parseQuery, MapLocationQueryDecoder } from './common/urlParse';
import { useUbiMqtt, lastKnownPosCache } from './location/mqttConnection';
import { BeaconGeoLocation } from './location/mqttDeserialize';
import { PinKind } from './map/marker';
import { ClientConfig } from './common/environment';

const inferLastKnownPosition = lastKnownPosCache();

const NotFound = () => <h3>404 page not found</h3>;

const Fullscreen = styled.div`
  display: flex;
  flex-direction: column;

  height: 100vh; /* fallback */
  height: calc(var(--vh, 1vh) * 100);

  overflow-x: hidden;
`;

const MainRow = styled.div`
  display: flex;
  height: 100%;
`;

export const isBeaconIdPromptOpen = (
  beaconId: string | null,
  isShareLocationModalOpen: boolean,
  isPublicShareOpen: boolean,
  isCentralizationButtonActive: boolean,
  isSettingsModeActive: boolean
) => {
  if (isCentralizationButtonActive) {
    return true;
  }

  if (isShareLocationModalOpen && beaconId === null) {
    return true;
  }

  if (isPublicShareOpen && beaconId === null) {
    return true;
  }

  if (isSettingsModeActive) {
    return true;
  }

  return false;
};

interface Props {
  appConfig: ClientConfig;
}

const Router = ({ appConfig }: Props) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isAdminPanelOpen, openAdminPanel] = useState(false);
  const [getDeviceLocation, setDeviceLocation] = useState<Location | null>(
    null
  );
  const [devices, setDevices] = useState<AndroidLocation[]>([]);
  const [newName, setNewName] = useState('');
  const [newHeight, setNewHeight] = useState('');

  // setRoomReserved can be used for controlling room reservation status.
  // TODO: use genuine MQTT bus data for room reservation status
  const [roomReserved, setRoomReserved] = useState(false);
  const [isShareLocationModalOpen, openShareLocationModal] = useState(false);
  const [isShareLocationDropdownOpen, openShareLocationDropdown] = useState(
    false
  );
  const [publicShareOpen, openPublicShare] = useState(false);
  const [beaconId, setBeaconId] = useState<string | null>(null);
  const [beaconToken, setBeaconToken] = useState<string | null>(null);

  const setBeacon = (beacon: Beacon | null) => {
    if (beacon === null) {
      setBeaconId(null);
      setBeaconToken(null);
      return;
    }

    setBeaconId(beacon.beaconId);
    setBeaconToken(beacon.token);
  };

  const [publicBeacons, setPublicBeacons] = useState<PublicBeacon[]>([]);

  /**
   * Used when user selects "only current" from the location prompt.
   */
  const [staticLocations, setStaticLocations] = useState<BeaconGeoLocation[]>(
    []
  );

  const queryParams = parseQuery(
    MapLocationQueryDecoder,
    document.location.search
  );

  const fromQuery = !!(queryParams && queryParams.lat && queryParams.lon);
  const initialPinType = fromQuery ? 'show' : 'none';

  const [pinType, setPinType] = useState<PinKind>(initialPinType);

  const mqttHost =
    queryParams && queryParams.host ? queryParams.host : appConfig.WEB_MQTT_URL;
  const beacons = useUbiMqtt(
    mqttHost,
    queryParams && queryParams.topic ? queryParams.topic : undefined
  );

  const lastKnownPosition = inferLastKnownPosition(beacons, beaconId);

  const [centralizeActive, setCentralizeActive] = useState(
    queryParams && queryParams.lat ? true : false
  );

  const [isSettingsModeActive, setSettingsModeActive] = useState(false);

  const adminTokenStore = new TokenStore<Admin>(ADMIN_STORE_ID);
  const beaconTokenStore = new TokenStore<Beacon>(BEACON_STORE_ID);

  useEffect(() => {
    const fetchPublicBeacons = async () => {
      const pubBeacons = await ShareLocationApi.fetchPublicBeacons();
      setPublicBeacons(pubBeacons);
    };

    const updateViewportHeight = () => {
      // 100vh hack for mobile https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
      // Without this, the content will overflow from the bottom.
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    window.addEventListener('resize', updateViewportHeight);

    fetchPublicBeacons();
    setAdmin(adminTokenStore.get());
    setBeacon(beaconTokenStore.get());
    updateViewportHeight();
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, []);

  return (
    <BrowserRouter>
      {isShareLocationModalOpen && beaconId && (
        <ShareLocationModal
          isOpen={isShareLocationModalOpen}
          onClose={() => openShareLocationModal(false)}
          currentBeaconId={beaconId}
        />
      )}
      {publicShareOpen && beaconId && (
        <PublicShareModal
          publishLocation={async enable => {
            if (!beaconToken) {
              console.log('cannot publish: beacon token not set');
              return;
            }

            if (enable) {
              const pubBeacon = await ShareLocationApi.publish(beaconToken);
              setPublicBeacons(PublicBeacons.update(publicBeacons, pubBeacon));

              console.log('published our location as user', pubBeacon.nickname);
            } else {
              try {
                console.log('disabling public location sharing');
                setPublicBeacons(PublicBeacons.remove(publicBeacons, beaconId));
                await ShareLocationApi.unpublish(beaconId, beaconToken);
              } catch (e) {
                // The beacon we tried to remove doesn't exist on the server
                // This could happen, e.g. because the server was restarted
                console.log('cannot unpublish', beaconId);
                console.log(e.message);
              }
            }
          }}
          publicBeacon={PublicBeacons.find(publicBeacons, beaconId)}
          onClose={() => openPublicShare(false)}
          isOpen={publicShareOpen}
        />
      )}
      {isBeaconIdPromptOpen(
        beaconId,
        isShareLocationModalOpen,
        publicShareOpen,
        centralizeActive,
        isSettingsModeActive
      ) && (
        <BeaconIdModal
          onClose={() => {
            setCentralizeActive(false);
            openShareLocationModal(false);
            openPublicShare(false);
            setSettingsModeActive(false);
          }}
          confirmId={async id => {
            const newBeacon = await ShareLocationApi.registerBeacon(id);
            setBeacon(newBeacon);
            beaconTokenStore.set(newBeacon);
            setStaticLocations([]);
            setPinType('none');
            setCentralizeActive(false);
            setSettingsModeActive(false);
          }}
          currentBeaconId={beaconId}
        />
      )}
      <Fullscreen>
        <NavBar
          isAdmin={admin != null}
          openAdminPanel={openAdminPanel}
          isAdminPanelOpen={isAdminPanelOpen}
          isShareLocationDropdownOpen={isShareLocationDropdownOpen}
          openShareLocationDropdown={openShareLocationDropdown}
          openShareLocationModal={openShareLocationModal}
          publicShareOpen={publicShareOpen}
          openPublicShare={openPublicShare}
        />
        <MainRow>
          <Route
            exact
            path="/"
            render={() => (
              <Transition
                items={isAdminPanelOpen}
                from={{ marginLeft: -350 }}
                enter={{ marginLeft: 0 }}
                leave={{ marginLeft: -350 }}
                config={{ mass: 1, tension: 275, friction: 25, clamp: true }}
              >
                {show =>
                  show &&
                  (props => (
                    <AdminPanel
                      style={props}
                      newHeight={newHeight}
                      setNewHeight={setNewHeight}
                      newName={newName}
                      onLogout={() => {
                        setAdmin(null);
                        adminTokenStore.clear();
                        openAdminPanel(false);
                      }}
                      setNewName={setNewName}
                      onSubmit={_ => {
                        if (admin) {
                          const formattedDevices = devices.map(d => {
                            return {
                              observerId: d.name,
                              position: [d.lon, d.lat, d.height],
                            };
                          });

                          const message = JSON.stringify(formattedDevices);
                          AuthApi.sign(message, admin.token).then(
                            signedMessage => {
                              mqttClient.sendSignedMqttMessage(
                                appConfig.WEB_MQTT_URL,
                                JSON.stringify(signedMessage)
                              );
                            }
                          );
                        }
                      }}
                      onCancel={() => {
                        openAdminPanel(false);
                        setDeviceLocation(null);
                        setDevices([]);
                      }}
                      devices={devices}
                      setDevices={setDevices}
                      resetDeviceLocation={() => setDeviceLocation(null)}
                      getDeviceLocation={getDeviceLocation}
                    />
                  ))
                }
              </Transition>
            )}
          />

          <Switch>
            <Route
              exact
              path="/"
              render={props => (
                <MapContainer
                  {...props}
                  appConfig={appConfig}
                  isAdmin={admin !== null}
                  beacons={beacons}
                  pinType={pinType}
                  setPinType={setPinType}
                  lastKnownPosition={lastKnownPosition}
                  staticLocations={staticLocations}
                  setCentralizeActive={setCentralizeActive}
                  beaconId={beaconId}
                  roomReserved={roomReserved}
                  devices={devices}
                  getDeviceLocation={getDeviceLocation}
                  setDeviceLocation={setDeviceLocation}
                  isAdminPanelOpen={isAdminPanelOpen}
                  publicBeacons={publicBeacons}
                />
              )}
            />

            <Route
              exact
              path="/settings"
              render={props => (
                <SettingsContainer
                  {...props}
                  setSettingsModeActive={setSettingsModeActive}
                />
              )}
            />

            <Route exact path="/about" component={AboutContainer} />

            <Route
              exact
              path="/admin"
              render={props => (
                <LoginPromptContainer
                  {...props}
                  admin={admin}
                  setAdmin={setAdmin}
                />
              )}
            />

            {/* catch everything else */}
            <Route component={NotFound} />
          </Switch>
        </MainRow>
      </Fullscreen>
    </BrowserRouter>
  );
};

export default Router;

/*
   What is a SCOPE file. See documentation here:
   https://github.com/OpusCapita/react-showroom-client/blob/master/docs/scope-component.md
*/

import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { showroomScopeDecorator } from '@opuscapita/react-showroom-client';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContextProvider } from 'react-dnd';
import connectorGoogleDriveV2 from '@opuscapita/react-filemanager-connector-google-drive-v2';

@showroomScopeDecorator
export default
class FileNavigatorScope extends Component {
  constructor(props) {
    super(props);
    window.googleDriveSignIn = this.googleDriveSignIn.bind(this);
    window.googleDriveSignOut = this.googleDriveSignOut.bind(this);

    this.connectors = {
      google_drive_v2: connectorGoogleDriveV2
    };
  }

  getIcon(name) {
    return this.state.icons.filter(icon => icon.name === name)[0].svg;
  }

  googleDriveSignIn() {
    connectors.google_drive_v2.api.signIn();
  }

  googleDriveSignOut() {
    connectors.google_drive_v2.api.signOut();
  }

  render() {
    return (
      <div>
        <DragDropContextProvider backend={HTML5Backend}>
          {this._renderChildren()}
        </DragDropContextProvider>
      </div>
    );
  }
}

FileNavigatorScope.contextTypes = {
  i18n: PropTypes.object
};
FileNavigatorScope.childContextTypes = {
  i18n: PropTypes.object
};

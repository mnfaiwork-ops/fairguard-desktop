import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import type { StoresProps } from '../../@types/ferdium-components.types';
import Welcome from '../../components/auth/Welcome';

interface IProps extends Partial<StoresProps> {}

@inject('stores', 'actions')
@observer
class WelcomeScreen extends Component<IProps> {
  render(): ReactElement {
    return <Welcome />;
  }
}

export default WelcomeScreen;

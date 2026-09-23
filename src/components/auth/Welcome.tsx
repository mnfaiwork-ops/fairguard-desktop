import { noop } from 'lodash';
import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import type { StoresProps } from '../../@types/ferdium-components.types';
import serverlessLogin from '../../helpers/serverless-helpers';
import { H1 } from '../ui/headline';

const messages = defineMessages({
  serverless: {
    id: 'services.serverless',
    defaultMessage: 'Use FairGuard without an Account',
  },
  tagline: {
    id: 'welcome.fairguardTagline',
    defaultMessage:
      'A coaching companion for your WhatsApp numbers. Sign in to start watching chat pace.',
  },
});

interface IProps extends Partial<StoresProps>, WrappedComponentProps {}

@inject('actions')
@observer
class Welcome extends Component<IProps> {
  render(): ReactElement {
    const { intl } = this.props;

    return (
      <div className="welcome">
        <div className="welcome__content">
          <img
            src="./assets/images/logo.svg"
            className="welcome__logo"
            alt=""
          />
        </div>
        <div className="welcome__text">
          <H1>FairGuard</H1>
          <p className="welcome__tagline">
            {intl.formatMessage(messages.tagline)}
          </p>
        </div>
        <div className="welcome__buttons">
          <button
            type="button"
            className="button"
            onClick={() => serverlessLogin(this.props.actions)}
            onKeyDown={noop}
          >
            {intl.formatMessage(messages.serverless)}
          </button>
        </div>
      </div>
    );
  }
}

export default injectIntl(Welcome);

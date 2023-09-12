import { fireEvent, render } from '@testing-library/react';
import SettingMenu from '../components/SettingMenu/SettingMenu';
import { TransactionBuilderModalContext } from '../contexts';
import React from 'react';
import { defaultTheme } from '../utils/theme';
import { ThemeProvider } from 'styled-components';

jest.mock('react-icons/ai', () => {
  return {
    AiOutlinePlusCircle: jest.fn,
    AiOutlineSearch: jest.fn,
  };
});

jest.mock('react-icons/bi', () => {
  return {
    BiCheck: jest.fn,
  };
});

jest.mock('react-icons/bs', () => {
  return {
    BsClockHistory: jest.fn,
    BsInfoCircle: jest.fn,
  };
});

jest.mock('react-icons/cg', () => {
  return {
    CgSandClock: jest.fn,
  };
});

jest.mock('react-icons/fa', () => {
  return {
    FaClipboardCheck: jest.fn,
    FaRegClipboard: jest.fn,
    FaSignature: jest.fn,
  };
});

jest.mock('react-icons/fc', () => {
  return {
    FcCheckmark: jest.fn,
  };
});

jest.mock('react-icons/hi', () => {
  return {
    HiCheck: jest.fn,
    HiChevronDown: jest.fn,
    HiChevronUp: jest.fn,
    HiOutlinePencilAlt: jest.fn,
    HiOutlineUser: jest.fn,
  };
});

jest.mock('react-icons/io', () => {
  return {
    IoChevronBackCircleOutline: jest.fn,
    IoClose: jest.fn,
    IoColorPaletteOutline: jest.fn,
    IoCopyOutline: jest.fn,
    IoGlobeOutline: jest.fn,
    IoMdCheckmark: jest.fn,
    IoWalletOutline: jest.fn,
  };
});

jest.mock('react-icons/io5', () => {
  return {
    IoCopyOutline: jest.fn,
    IoMdCheckmark: jest.fn,
  };
});

jest.mock('react-icons/md', () => {
  return {
    MdOutlineDashboardCustomize: jest.fn,
    MdOutlineInfo: jest.fn,
    MdOutlineKeyboardArrowDown: jest.fn,
    MdOutlineKeyboardArrowUp: jest.fn,
    MdOutlineSettings: jest.fn,
  };
});

jest.mock('react-icons/tb', () => {
  return {
    TbCopy: jest.fn,
    TbLogout: jest.fn,
    TbWallet: jest.fn,
  };
});

jest.mock('../components/History/index.ts', () => {
  return jest.mock;
});

jest.mock('../components/User/UserProfile.tsx', () => {
  return jest.mock;
});

describe('builder setting menu', () => {
  test('should render builder setting menu', async () => {
    const defaultValue = {
      data: {
        showConfirmModal: jest.fn,
        showAlertModal: jest.fn,
        showModal: jest.fn,
        hideModal: jest.fn,
      },
    };
    const menuContext = render(
      <TransactionBuilderModalContext.Provider value={defaultValue}>
        <ThemeProvider theme={{ ...defaultTheme }}>
          <SettingMenu logout={() => {}} showLogout={true} />
        </ThemeProvider>
      </TransactionBuilderModalContext.Provider>,
    );

    fireEvent.click(await menuContext.findByTestId('builder-setting-menu'));
    expect(menuContext.getByText('Dashboard')).toHaveAttribute('href', 'https://dashboard.etherspot.io');
    expect(menuContext.getByText('Profile')).toBeInTheDocument();
    expect(menuContext.getByText('History')).toBeInTheDocument();
    expect(menuContext.getByText('Etherspot')).toHaveAttribute('href', 'https://etherspot.io/');
    expect(menuContext.getByText('Logout')).toBeInTheDocument();
  });
});

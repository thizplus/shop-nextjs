'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, MenuSection, SubMenu } from '@menu/vertical-menu'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { settings } = useSettings()
  const { isBreakpointReached } = useVerticalNav()

  // Vars
  const { transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href='/dashboard' icon={<i className='tabler-smart-home' />}>
          แดชบอร์ด
        </MenuItem>

        <MenuItem href='/dashboard/daily-payments' icon={<i className='tabler-report-money' />}>
          รายการรอชำระเงิน
        </MenuItem>



        <MenuSection label='MAIN SYSTEM'>
          <SubMenu label='สินค้า' icon={<i className='tabler-list-details' />}>
            <MenuItem href='/dashboard/products'>สินค้าทั้งหมด</MenuItem>
            <MenuItem href='/dashboard/category'>หมวดหมู่</MenuItem>
            <MenuItem href='/dashboard/price'>ราคาสินค้า</MenuItem>


          </SubMenu>
        </MenuSection>



        <MenuSection label='SHOP SYSTEM'>
          <MenuItem icon={<i className='tabler-users-group' />} href='/dashboard/clients'>ลูกค้าทั้งหมด</MenuItem>
          <MenuItem icon={<i className='tabler-building-store' />} href='/dashboard/orders'>คำสั่งซื้อทั้งหมด</MenuItem>
        </MenuSection>


        <MenuSection label='EXTENSION'>
          <MenuItem icon={<i className='tabler-discount-check-filled' />} href='/dashboard/coupons'>ระบบคูปอง</MenuItem>
          <MenuItem icon={<i className='tabler-number-123' />} href='/dashboard/point'>ระบบสะสมแต้ม</MenuItem>
        </MenuSection>


        <MenuSection label='SYSTEM SETTING'>
          <MenuItem icon={<i className='tabler-settings' />} href='/dashboard/setting'>ตั้งค่าพื้นฐาน</MenuItem>
        </MenuSection>

      </Menu>
      {/* <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <GenerateVerticalMenu menuData={menuData(dictionary, params)} />
      </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu

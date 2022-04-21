/* // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract AidBondToken is Context, AccessControl, Ownable, ERC20, ERC20Pausable, ERC20Burnable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint8 private decimal;
    
    constructor(string memory tokenName, string memory tokenSymbol, uint256 initialSupply, uint8 decimal_) ERC20(tokenName, tokenSymbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
        
        decimal = decimal_;
        initialSupply = initialSupply * (10 ** uint256(decimal));
        
        _mint(msg.sender, initialSupply);   
    }
    
    function decimals() public view virtual override returns (uint8) {
        return decimal;
    }
    
   
    function pause() public virtual {
        require(hasRole(PAUSER_ROLE, _msgSender()), "ERC20PresetMinterPauser: must have pauser role to pause");
        _pause();
    }

    
    function unpause() public virtual {
        require(hasRole(PAUSER_ROLE, _msgSender()), "ERC20PresetMinterPauser: must have pauser role to unpause");
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
} */
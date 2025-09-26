import { Address } from '../types';

export interface SavedAddress extends Address {
  id: string;
  label: string;
  isDefault: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

class SavedAddressService {
  private storageKey = 'zapp_saved_addresses';

  // Get all saved addresses for the current user
  getSavedAddresses(userId?: string): SavedAddress[] {
    if (!userId) return [];
    
    try {
      const saved = localStorage.getItem(`${this.storageKey}_${userId}`);
      if (!saved) return [];
      
      const addresses = JSON.parse(saved);
      return addresses.map((addr: any) => ({
        ...addr,
        createdAt: new Date(addr.createdAt),
        lastUsed: addr.lastUsed ? new Date(addr.lastUsed) : undefined
      }));
    } catch (error) {
      console.error('Error loading saved addresses:', error);
      return [];
    }
  }

  // Save a new address
  saveAddress(address: Address, label: string, userId?: string, isDefault = false): SavedAddress {
    if (!userId) throw new Error('User ID required to save address');

    const savedAddress: SavedAddress = {
      ...address,
      id: this.generateId(),
      label,
      isDefault,
      createdAt: new Date(),
      lastUsed: new Date()
    };

    const existingAddresses = this.getSavedAddresses(userId);
    
    // If this is set as default, remove default from others
    if (isDefault) {
      existingAddresses.forEach(addr => addr.isDefault = false);
    }

    const updatedAddresses = [...existingAddresses, savedAddress];
    this.saveToStorage(updatedAddresses, userId);
    
    return savedAddress;
  }

  // Update an existing address
  updateAddress(addressId: string, updates: Partial<SavedAddress>, userId?: string): SavedAddress | null {
    if (!userId) return null;

    const addresses = this.getSavedAddresses(userId);
    const addressIndex = addresses.findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) return null;

    // If setting as default, remove default from others
    if (updates.isDefault) {
      addresses.forEach(addr => addr.isDefault = false);
    }

    addresses[addressIndex] = {
      ...addresses[addressIndex],
      ...updates,
      lastUsed: new Date()
    };

    this.saveToStorage(addresses, userId);
    return addresses[addressIndex];
  }

  // Delete an address
  deleteAddress(addressId: string, userId?: string): boolean {
    if (!userId) return false;

    const addresses = this.getSavedAddresses(userId);
    const filteredAddresses = addresses.filter(addr => addr.id !== addressId);
    
    if (filteredAddresses.length === addresses.length) return false;

    this.saveToStorage(filteredAddresses, userId);
    return true;
  }

  // Mark address as used (updates lastUsed timestamp)
  markAsUsed(addressId: string, userId?: string): void {
    if (!userId) return;

    const addresses = this.getSavedAddresses(userId);
    const address = addresses.find(addr => addr.id === addressId);
    
    if (address) {
      address.lastUsed = new Date();
      this.saveToStorage(addresses, userId);
    }
  }

  // Get default address
  getDefaultAddress(userId?: string): SavedAddress | null {
    const addresses = this.getSavedAddresses(userId);
    return addresses.find(addr => addr.isDefault) || null;
  }

  // Check if address already exists (to avoid duplicates)
  addressExists(address: Address, userId?: string): SavedAddress | null {
    const addresses = this.getSavedAddresses(userId);
    return addresses.find(saved => 
      saved.street.toLowerCase() === address.street.toLowerCase() &&
      saved.city.toLowerCase() === address.city.toLowerCase() &&
      saved.state.toLowerCase() === address.state.toLowerCase() &&
      saved.zipCode === address.zipCode
    ) || null;
  }

  private saveToStorage(addresses: SavedAddress[], userId: string): void {
    try {
      localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(addresses));
    } catch (error) {
      console.error('Error saving addresses:', error);
    }
  }

  private generateId(): string {
    return `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const savedAddressService = new SavedAddressService();
export default savedAddressService;
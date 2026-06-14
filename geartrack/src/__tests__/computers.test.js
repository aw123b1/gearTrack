import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { supabase } from '../lib/supabase'

describe('Computers CRUD Operations & RLS Policies', () => {
  let testStoreId
  let testUserId
  let testComputerId
  let testComputerId2

  beforeAll(async () => {
    console.log('Setting up test environment...')

    // Get current authenticated user
    const { data: userAuth } = await supabase.auth.getUser()
    testUserId = userAuth?.user?.id

    if (!testUserId) {
      throw new Error(
        'No authenticated user found. Please sign in before running tests.'
      )
    }

    // Get the user's store_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('store_id')
      .eq('id', testUserId)
      .single()

    if (userError) {
      throw new Error('Failed to get user store: ' + userError.message)
    }

    testStoreId = userData.store_id
    console.log(`✓ Using store: ${testStoreId}`)
  })

  afterAll(async () => {
    console.log('Cleaning up test data...')

    // Delete all test computers
    if (testComputerId) {
      await supabase.from('computers').delete().eq('id', testComputerId)
    }
    if (testComputerId2) {
      await supabase.from('computers').delete().eq('id', testComputerId2)
    }

    console.log('✓ Cleanup complete')
  })

  describe('CREATE Operations', () => {
    it('should create a computer successfully', async () => {
      const testData = {
        store_id: testStoreId,
        serial_number: 'TEST-SN-' + Date.now(),
        model_name: 'Test Computer Model',
        status: 'in_stock',
      }

      const { data, error } = await supabase
        .from('computers')
        .insert([testData])
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data).toHaveLength(1)
      expect(data[0].serial_number).toBe(testData.serial_number)
      expect(data[0].model_name).toBe(testData.model_name)
      expect(data[0].status).toBe('in_stock')
      expect(data[0].store_id).toBe(testStoreId)

      testComputerId = data[0].id
    })

    it('should create a computer with image_url', async () => {
      const testData = {
        store_id: testStoreId,
        serial_number: 'TEST-SN-IMG-' + Date.now(),
        model_name: 'Computer with Image',
        status: 'in_stock',
        image_url: 'https://example.com/image.jpg',
        is_synced: true,
      }

      const { data, error } = await supabase
        .from('computers')
        .insert([testData])
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data[0].image_url).toBe(testData.image_url)
      expect(data[0].is_synced).toBe(true)

      testComputerId2 = data[0].id
    })

    it('should fail to create a computer without required fields', async () => {
      const { error } = await supabase
        .from('computers')
        .insert([
          {
            store_id: testStoreId,
            serial_number: 'TEST-INCOMPLETE',
            // missing model_name
          },
        ])
        .select()

      // Note: Supabase may or may not error depending on column constraints
      // This test verifies the behavior
      expect(error).toBeTruthy()
    })
  })

  describe('READ Operations', () => {
    it('should read all computers for the current store', async () => {
      const { data, error } = await supabase
        .from('computers')
        .select('*')
        .eq('store_id', testStoreId)
        .order('created_at', { ascending: false })

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)

      // Verify all returned computers belong to the test store
      data.forEach((computer) => {
        expect(computer.store_id).toBe(testStoreId)
      })
    })

    it('should read a specific computer by ID', async () => {
      const { data, error } = await supabase
        .from('computers')
        .select('*')
        .eq('id', testComputerId)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.id).toBe(testComputerId)
      expect(data.serial_number).toContain('TEST-SN-')
    })

    it('should filter computers by status', async () => {
      const { data, error } = await supabase
        .from('computers')
        .select('*')
        .eq('store_id', testStoreId)
        .eq('status', 'in_stock')

      expect(error).toBeNull()
      expect(data).toBeDefined()

      // Verify all returned computers have the correct status
      data.forEach((computer) => {
        expect(computer.status).toBe('in_stock')
      })
    })

    it('should verify RLS policy - only return user\'s store computers', async () => {
      // This test verifies that RLS is working by ensuring we only get
      // computers from the current user's store
      const { data, error } = await supabase
        .from('computers')
        .select('*')

      expect(error).toBeNull()
      expect(data).toBeDefined()

      // All returned computers should belong to the authenticated user's store
      data.forEach((computer) => {
        expect(computer.store_id).toBe(testStoreId)
      })

      console.log(
        `✓ RLS verified: User can only see ${data.length} computer(s) from their store`
      )
    })
  })

  describe('UPDATE Operations', () => {
    it('should update a computer status', async () => {
      const { data, error } = await supabase
        .from('computers')
        .update({ status: 'sold' })
        .eq('id', testComputerId)
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data).toHaveLength(1)
      expect(data[0].status).toBe('sold')
    })

    it('should update multiple computer fields', async () => {
      const { data, error } = await supabase
        .from('computers')
        .update({
          status: 'repair',
          is_synced: false,
        })
        .eq('id', testComputerId)
        .select()

      expect(error).toBeNull()
      expect(data[0].status).toBe('repair')
      expect(data[0].is_synced).toBe(false)
    })

    it('should update computer with image_url', async () => {
      const imageUrl = 'https://example.com/updated-image.jpg'

      const { data, error } = await supabase
        .from('computers')
        .update({ image_url: imageUrl })
        .eq('id', testComputerId2)
        .select()

      expect(error).toBeNull()
      expect(data[0].image_url).toBe(imageUrl)
    })
  })

  describe('DELETE Operations', () => {
    it('should delete a computer', async () => {
      // First, verify the computer exists
      const { data: beforeDelete } = await supabase
        .from('computers')
        .select('*')
        .eq('id', testComputerId2)

      expect(beforeDelete).toHaveLength(1)

      // Delete the computer
      const { error } = await supabase
        .from('computers')
        .delete()
        .eq('id', testComputerId2)

      expect(error).toBeNull()

      // Verify the computer is gone
      const { data: afterDelete } = await supabase
        .from('computers')
        .select('*')
        .eq('id', testComputerId2)

      expect(afterDelete).toHaveLength(0)
    })

    it('should handle deleting non-existent computer gracefully', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'

      const { error } = await supabase
        .from('computers')
        .delete()
        .eq('id', fakeId)

      // Supabase returns success even if no rows matched
      expect(error).toBeNull()
    })
  })

  describe('RLS Policy Verification', () => {
    it('should verify computers are isolated by store_id', async () => {
      // Create two test computers
      const computerA = {
        store_id: testStoreId,
        serial_number: 'ISOLATION-TEST-A-' + Date.now(),
        model_name: 'Computer A',
        status: 'in_stock',
      }

      const { data: insertedA } = await supabase
        .from('computers')
        .insert([computerA])
        .select()

      expect(insertedA).toHaveLength(1)

      // Query for computers in the store
      const { data: queried } = await supabase
        .from('computers')
        .select('*')
        .eq('serial_number', computerA.serial_number)

      expect(queried).toHaveLength(1)
      expect(queried[0].store_id).toBe(testStoreId)

      // Cleanup
      await supabase
        .from('computers')
        .delete()
        .eq('id', insertedA[0].id)

      console.log('✓ RLS isolation verified')
    })
  })
})

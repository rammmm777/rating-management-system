const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./rating_system.db');

async function createSampleData() {
  try {
    // Create sample users
    const userPassword = await bcrypt.hash('UserPass123!', 10);
    const ownerPassword = await bcrypt.hash('OwnerPass123!', 10);
    
    // Create a store owner
    db.run('INSERT OR REPLACE INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)', 
      ['Store Owner Name Long Enough', 'owner@example.com', ownerPassword, 'owner'],
      function(err) {
        if (err) console.error('Error creating owner:', err.message);
        else console.log('Store owner created');
        
        // Create a regular user
        db.run('INSERT OR REPLACE INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)', 
          ['Regular User Name Long Enough', 'user@example.com', userPassword, 'user'],
          function(err) {
            if (err) console.error('Error creating user:', err.message);
            else console.log('Regular user created');
            
            // Create sample stores
            const stores = [
              ['Amazing Electronics Store Name Here', 'electronics@store.com', '123 Main Street, City'],
              ['Fashion Boutique Shopping Center', 'fashion@store.com', '456 Fashion Avenue'],
              ['Book World Library Store Name', 'books@store.com', '789 Literary Lane']
            ];
            
            stores.forEach((store, index) => {
              db.run('INSERT OR REPLACE INTO Stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)', 
                [...store, index === 0 ? 5 : null], // First store owned by the owner we created
                function(err) {
                  if (err) console.error('Error creating store:', err.message);
                  else console.log(`Store ${store[0]} created`);
                }
              );
            });
            
            // Create sample ratings
            setTimeout(() => {
              const ratings = [
                [2, 1, 5], // user_id 2, store_id 1, rating 5
                [2, 2, 4], // user_id 2, store_id 2, rating 4
                [2, 3, 3], // user_id 2, store_id 3, rating 3
              ];
              
              ratings.forEach(([userId, storeId, rating]) => {
                db.run('INSERT OR REPLACE INTO Ratings (user_id, store_id, rating) VALUES (?, ?, ?)', 
                  [userId, storeId, rating],
                  function(err) {
                    if (err) console.error('Error creating rating:', err.message);
                    else console.log(`Rating created for store ${storeId}`);
                  }
                );
              });
              
              console.log('\nSample data created successfully!');
              console.log('\nLogin credentials:');
              console.log('Admin: admin@example.com / AdminPass123!');
              console.log('Owner: owner@example.com / OwnerPass123!');
              console.log('User: user@example.com / UserPass123!');
              
              db.close();
            }, 1000);
          }
        );
      }
    );
  } catch (error) {
    console.error('Error:', error);
    db.close();
  }
}

createSampleData();

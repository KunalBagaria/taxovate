// Slab rates according to new Indian income taxation regime. Can be adjusted according to any country's taxation slab rates.s

pub fn get_tax_percentage(amount: u64) -> u64 {
    let tax_percentage = if amount < 2_50_000 {
        0
    } else if amount < 5_00_000 {
        5
    } else if amount < 7_50_000 {
        10
    } else if amount < 10_00_000 {
        15
    } else if amount < 12_50_000 {
        20
    } else if amount < 15_00_000 {
        25
    } else {
        30
    };
    return tax_percentage;
}
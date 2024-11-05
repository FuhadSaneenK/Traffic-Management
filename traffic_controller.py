# traffic_controller.py

# Constants for duration control
MIN_DURATION = 10    # Minimum 10 seconds even with no vehicles
MAX_DURATION = 60    # Maximum duration for heavy traffic
INITIAL_DURATION = 15  # Initial duration when system starts

def calculate_duration(vehicle_counts):
    """
    Calculate signal duration with high sensitivity to vehicle count changes.
    Each additional vehicle affects the duration more directly.
    
    Args:
        vehicle_counts (list): List of vehicle counts for each lane
    
    Returns:
        int: Calculated duration in seconds (between MIN_DURATION and MAX_DURATION)
    """
    if not vehicle_counts:
        return MIN_DURATION
        
    total_lanes = len(vehicle_counts)
    current_lane = 0  # Index of current green lane
    next_lane = (current_lane + 1) % total_lanes
    next_lane_count = vehicle_counts[next_lane]
    
    # Empty lane gets minimum duration
    if next_lane_count == 0:
        return MIN_DURATION
    
    # Direct linear scaling based on vehicle count
    # Using 2 seconds per vehicle as base multiplier
    base_duration = MIN_DURATION + (next_lane_count * 2)
    
    # Apply progressive multiplier for higher counts
    # This ensures even small changes in higher counts make a difference
    if next_lane_count > 25:
        duration = base_duration * 1.3
    elif next_lane_count > 20:
        duration = base_duration * 1.2
    elif next_lane_count > 15:
        duration = base_duration * 1.1
    elif next_lane_count > 10:
        duration = base_duration * 1.05
    else:
        duration = base_duration
    
    # Compare with other lanes to ensure fairness
    active_counts = [count for count in vehicle_counts if count > 0]
    if active_counts:
        avg_vehicles = sum(active_counts) / len(active_counts)
        ratio = next_lane_count / avg_vehicles if avg_vehicles > 0 else 1
        
        # Fine-tune duration based on ratio to average
        if ratio > 1.5:
            duration *= 1.1
        elif ratio < 0.5:
            duration *= 0.9
    
    # Ensure duration stays within bounds
    final_duration = int(min(MAX_DURATION, max(MIN_DURATION, duration)))
    
    return final_duration

test_cases = [
    [0, 2, 27, 11],    # Original case
    [0, 3, 27, 11],    # One more vehicle in lane 2
    [0, 2, 28, 11],    # One more vehicle in lane 3
    [0, 2, 27, 12],    # One more vehicle in lane 4
    [0, 1, 27, 11],    # One less vehicle in lane 2
    [0, 2, 26, 11],    # One less vehicle in lane 3
    [0, 2, 27, 10],    # One less vehicle in lane 4
]

for counts in test_cases:
    duration = calculate_duration(counts)
    print(f"Counts: {counts} -> Duration: {duration}s")
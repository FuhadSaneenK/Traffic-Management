MIN_DURATION = 10  # Minimum 10 seconds even with no vehicles
MAX_DURATION = 45  # Maximum duration for heavy traffic
INITIAL_DURATION = 15

def calculate_duration(vehicle_counts):
    """
    Calculate signal duration based on vehicle counts.
    
    Args:
        vehicle_counts (list): List of vehicle counts for each lane
    
    Returns:
        int: Calculated duration in seconds
    """
    if not vehicle_counts:
        return MIN_DURATION
    
    # Get next lane's vehicle count (circular)
    total_lanes = len(vehicle_counts)
    current_lane = 0  # Index of current green lane
    next_lane = (current_lane + 1) % total_lanes
    next_lane_count = vehicle_counts[next_lane]
    
    # Calculate total vehicles across all lanes
    total_vehicles = sum(vehicle_counts)
    
    if next_lane_count == 0:
        return MIN_DURATION
        
    # Calculate duration based on next lane's proportion of total vehicles
    proportion = next_lane_count / total_vehicles
    base_duration = proportion * MAX_DURATION
    
    # Adjust duration based on traffic density
    if next_lane_count > 30:  # Heavy traffic
        duration = min(MAX_DURATION, base_duration * 1.2)
    elif next_lane_count > 20:  # Moderate-heavy traffic
        duration = min(MAX_DURATION, base_duration * 1.1)
    elif next_lane_count < 5:  # Very light traffic
        duration = max(MIN_DURATION, base_duration * 0.8)
    else:  # Normal traffic
        duration = base_duration
    
    # Ensure duration is within bounds
    final_duration = int(min(MAX_DURATION, max(MIN_DURATION, duration)))
    
    return final_duration
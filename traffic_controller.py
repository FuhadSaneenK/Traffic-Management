def calculate_duration(current_lane_count):
    """
    Calculate the duration based on the current lane vehicle count.
    
    Args:
        current_lane_count (int): The number of vehicles in the current lane.
        
    Returns:
        int: The duration in seconds.
    """
    if current_lane_count < 10:
        return 10
    elif current_lane_count < 20:
        return 15
    else:
        return 20
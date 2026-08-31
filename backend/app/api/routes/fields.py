from fastapi import APIRouter

router = APIRouter()

@router.get("/zones")
def get_zones():
    return {
        "fields": [
            {
                "field_id": "Field 01",
                "polygon_coordinates": [[-122.4194, 37.7749], [-122.4195, 37.7750], [-122.4193, 37.7751]],
                "telemetry": {"vegetation_index": 0.82, "moisture_pct": 21.4}
            },
            {
                "field_id": "Field 02",
                "polygon_coordinates": [[-122.4200, 37.7760], [-122.4201, 37.7761], [-122.4199, 37.7762]],
                "telemetry": {"vegetation_index": 0.75, "moisture_pct": 19.8}
            },
            {
                "field_id": "Field 03",
                "polygon_coordinates": [[-122.4210, 37.7770], [-122.4211, 37.7771], [-122.4209, 37.7772]],
                "telemetry": {"vegetation_index": 0.90, "moisture_pct": 25.0}
            },
            {
                "field_id": "Field 04",
                "polygon_coordinates": [[-122.4220, 37.7780], [-122.4221, 37.7781], [-122.4219, 37.7782]],
                "telemetry": {"vegetation_index": 0.65, "moisture_pct": 15.2}
            }
        ]
    }

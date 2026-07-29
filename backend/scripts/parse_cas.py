import sys
import json
import traceback

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: parse_cas.py <pdf_path> <password>"}))
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    password = sys.argv[2]
    
    try:
        import casparser
        from casparser.exceptions import IncorrectPasswordError, CASParseError
    except ImportError:
        print(json.dumps({"error": "casparser library not installed. Run 'pip install casparser'."}))
        sys.exit(1)
        
    try:
        if password == "secret_dummy":
            # Mock data for testing the DB insertion pipeline
            data = {
                "folios": [
                    {
                        "folio": "1234567890",
                        "schemes": [
                            {
                                "scheme": "HDFC Flexi Cap Fund",
                                "isin": "INF179K01W82",
                                "units": 150.5,
                                "valuation": { "value": 150000.0, "nav": 996.67 }
                            },
                            {
                                "scheme": "SBI Small Cap Fund",
                                "isin": "INF200K01T28",
                                "units": 200.0,
                                "valuation": { "value": 85000.0, "nav": 425.0 }
                            },
                            {
                                "scheme": "Unknown Bond Scheme (No ISIN)",
                                "isin": "",
                                "units": 10.0,
                                "valuation": { "value": 10000.0, "nav": 1000.0 }
                            }
                        ]
                    }
                ]
            }
            print(json.dumps(data, default=str))
            sys.exit(0)

        data = casparser.read_cas_pdf(pdf_path, password, output="dict")
        print(json.dumps(data, default=str))
        sys.exit(0)
    except IncorrectPasswordError:
        print(json.dumps({"error": "Incorrect password", "type": "INCORRECT_PASSWORD"}))
        sys.exit(10)
    except CASParseError as e:
        print(json.dumps({"error": f"Couldn't read this statement format: {str(e)}", "type": "PARSE_ERROR"}))
        sys.exit(11)
    except Exception as e:
        # Some other failure
        print(json.dumps({"error": str(e), "traceback": traceback.format_exc(), "type": "UNKNOWN"}))
        sys.exit(1)

if __name__ == "__main__":
    main()

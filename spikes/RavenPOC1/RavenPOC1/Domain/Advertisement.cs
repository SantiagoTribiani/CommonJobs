﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace RavenPOC1.Domain
{
    public class Advertisement
    {
        public int Id { get; set; }
        public string MediaName { get; set; }
        public string Content { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public int SearchId { get; set; }
    }
}

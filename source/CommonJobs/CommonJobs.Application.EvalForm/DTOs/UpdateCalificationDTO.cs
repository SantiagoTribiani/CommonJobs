﻿using CommonJobs.Domain.Evaluations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CommonJobs.Application.EvalForm.Dtos
{
    public class UpdateCalificationDto
    {
        public string CalificationId { get; set; }

        public List<CalificationItem> Items { get; set; }

        public string Comments { get; set; }
    }    
}
